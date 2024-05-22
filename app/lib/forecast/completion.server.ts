import OpenAI from "openai"
import { result } from "~/lib/core"
import type { ValueOf, FuncResult } from "~/lib/core"
import { createEventEmitter } from "~/lib/core/events.server"
import { defaultLocale } from "~/lib/i18n"
import { wearSuggestionSchema } from "~/lib/forecast"
import type { WearSuggestion, WearForecast } from "~/lib/forecast"
import { temperatureUnit as tempUnit } from "~/lib/weather"
import type { TemperatureUnit, WeatherForecast } from "~/lib/weather"
import type { ForecastApi } from "~/lib/forecast/api.server"

const forecastCompletionEventName = "completion" as const

const forecastCompletionEventStatus = {
  completed: "completed",
  fetchingSuggestion: "fetching_suggestion",
  generatingImage: "generating_image",
  failed: "failed"
} as const

type ForecastCompletionEventStatus = ValueOf<
  typeof forecastCompletionEventStatus
>

interface ForecastCompletionEvent {
  id: string
  urlSlug: string
  status: ForecastCompletionEventStatus
}

const forecastCompletionEventEmitter =
  createEventEmitter<ForecastCompletionEvent>(forecastCompletionEventName)

const formatContent = (content: string[]) => {
  return content.join(" ")
}

const getWeatherForecastContent = (
  weatherForecast: WeatherForecast
): string => {
  const location = {
    areaName: weatherForecast.city.name,
    country: weatherForecast.city.country
  }

  const weather = {
    hourly: weatherForecast.list.map((h) => {
      return {
        ...h.main,
        weather: h.weather.map((w) => {
          return {
            main: w.main,
            description: w.description
          }
        }),
        clouds: h.clouds,
        wind: h.wind,
        visibility: h.visibility,
        chanceOfRain: h.pop * 100,
        time: h.dt_txt
      }
    })
  }

  return JSON.stringify({ location, weather })
}

const fetchSuggestion = async (
  openAI: OpenAI,
  forecast: WearForecast,
  temperatureUnit?: TemperatureUnit,
  culture?: string
): Promise<FuncResult<WearSuggestion, Error>> => {
  const requestTemperatureUnit = temperatureUnit ?? tempUnit.celcius
  const requestCulture = culture ?? defaultLocale.culture

  const { fit, style } = forecast.profile

  try {
    const weatherContent = getWeatherForecastContent(forecast.weather)

    if (!weatherContent) {
      // TODO: Custom error type
      throw new Error(
        "Could not get weather forecast content for completion prompt."
      )
    }

    const completion = await openAI.chat.completions.create({
      messages: [
        {
          role: "system",
          content: formatContent([
            "You are a helpful fashion assistant. You are giving advice on what to wear based on the current local weather.",
            "You are informative in your advice, but as concise as possible providing 2-3 sentences at the most.",
            "You separately provide a third-person objective description of the subject wearing the clothes that can be used as a prompt to generate an image of the subject wearing the clothes that you have advised, but keep the prompt as concise as possible providing 1 sentence at the most.",
            "You separately provide a brief summary of the day's weather using simple keywords, but you are as concise as possible providing 10 keywords at the most.",
            "You don't include the temperature or other numbers in the description prompt or the summary keywords.",
            `You format the output as JSON. You use a consistent JSON schema, which is as follows: { "advice": "string", "description": "string", "weather": "string" }`
          ])
        },
        {
          role: "user",
          content: formatContent([
            "Based on the weather data below, give me advice on how warmly to dress, for example, wear a jumper or t-shirt, trousers, shorts or skirt, a light or warm coat, a scarf and gloves, if I should carry an umbrella, etc.",
            `I wear clothing typically made to fit ${fit.name}. I like to dress in a ${style.name} style. Assume I'll wear the same outfit the whole day.`,
            `In your response, use the hourly temperature data from the weather data below to explain your recommendation. Only use ${requestTemperatureUnit}, and respond in my preferred language, which is ${requestCulture}.`
          ])
        },
        {
          role: "user",
          content: weatherContent
        }
      ],
      model: "gpt-4-1106-preview",
      max_tokens: 150,
      seed: 1001,
      response_format: { type: "json_object" }
    })

    const content = completion.choices[0]?.message.content ?? ""

    if (!content) {
      // TODO: Custom error type
      throw new Error("Completion returned with no content.")
    }

    // Validate if the content is valid JSON and matches the expected schema

    const suggestion = await wearSuggestionSchema.parseAsync({
      ...JSON.parse(content),
      meta: {
        id: completion.id,
        model: completion.model,
        usage: completion.usage,
        system_fingerprint: completion.system_fingerprint
      }
    })

    return result.ok(suggestion)
  } catch (error) {
    return result.error(
      new Error("Failed to fetch forecast completion.", { cause: error })
    )
  }
}

const generateImageFromSuggestion = async (
  openAI: OpenAI,
  forecast: WearForecast
): Promise<FuncResult<string, Error>> => {
  if (!forecast.suggestion) {
    return result.error(
      new Error(
        `Cannot generate image for forecast '${forecast.id}' because suggestion is missing.`
      )
    )
  }

  const { subject, fit, style } = forecast.profile
  const { description } = forecast.suggestion

  try {
    const generation = await openAI.images.generate({
      model: "dall-e-3",
      prompt: formatContent([
        "A colorful illustration in an anime style.",
        `In the foreground is a full-body pose of a ${subject.name} dressed in ${style.name} clothes that have been made to fit ${fit.name}, ${description}`,
        `In the background is an outdoor scene that complements the foreground image.`
      ]),
      n: 1,
      size: "1024x1024",
      response_format: "url"
    })

    const url = generation.data[0]?.url ?? ""

    if (!url) {
      // TODO: Custom error type
      throw new Error("Generated image returned with no data.")
    }

    return result.ok(url)
  } catch (error) {
    // TODO: https://platform.openai.com/docs/guides/images/error-handling
    return result.error(
      new Error("Failed to generate image from suggestion.", {
        cause: error
      })
    )
  }
}

const isComplete = (forecast: WearForecast): boolean => {
  if (forecast.suggestion && forecast.imagePath) {
    return true
  }

  return false
}

const createWearForecastCompletionApi = (forecastApi: ForecastApi) => {
  return {
    isComplete,
    completeForecast: async (
      forecast: WearForecast
    ): Promise<FuncResult<WearForecast>> => {
      if (isComplete(forecast)) {
        forecastCompletionEventEmitter.emit({
          id: forecast.id,
          urlSlug: forecast.urlSlug,
          status: forecastCompletionEventStatus.completed
        })

        return result.ok(forecast)
      }

      try {
        const openAI = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY ?? ""
        })

        if (!forecast.suggestion) {
          // Ask for clothing suggestion based on the profile and weather

          forecastCompletionEventEmitter.emit({
            id: forecast.id,
            urlSlug: forecast.urlSlug,
            status: forecastCompletionEventStatus.fetchingSuggestion
          })

          const [suggestion, suggestionError] = await fetchSuggestion(
            openAI,
            forecast
          )

          if (suggestionError) {
            // TODO: Deal with error
            throw new Error(suggestionError.message)
          }

          // Update the forecast with the suggestion

          forecast.suggestion = suggestion

          const [updatedForecast, updateForecastError] =
            await forecastApi.updateForecast(forecast)

          if (updateForecastError) {
            // TODO: Deal with error
            throw new Error(updateForecastError.message)
          } else {
            forecast = updatedForecast
          }
        }

        if (forecast.suggestion && !forecast.imagePath) {
          // Generate the image based on the profile and suggestion

          forecastCompletionEventEmitter.emit({
            id: forecast.id,
            urlSlug: forecast.urlSlug,
            status: forecastCompletionEventStatus.generatingImage
          })

          const [imageUrl, imageUrlError] = await generateImageFromSuggestion(
            openAI,
            forecast
          )

          if (imageUrlError) {
            // TODO: Deal with error
            throw new Error(imageUrlError.message)
          }

          // Upload the image to storage

          const [updatedForecast, updateForecastError] =
            await forecastApi.addImageToForecast(forecast, imageUrl)

          if (updateForecastError) {
            // TODO: Deal with error
            throw new Error(updateForecastError.message)
          } else {
            forecast = updatedForecast
          }
        }

        forecastCompletionEventEmitter.emit({
          id: forecast.id,
          urlSlug: forecast.urlSlug,
          status: forecastCompletionEventStatus.completed
        })

        return result.ok(forecast)
      } catch (error) {
        forecastCompletionEventEmitter.emit({
          id: forecast.id,
          urlSlug: forecast.urlSlug,
          status: forecastCompletionEventStatus.failed
        })

        // TODO: Error handling
        const err = error as Error

        return result.error(err)
      }
    }
  }
}

export {
  createWearForecastCompletionApi,
  forecastCompletionEventName,
  forecastCompletionEventStatus,
  forecastCompletionEventEmitter
}

export type { ForecastCompletionEvent, ForecastCompletionEventStatus }
