import OpenAI from "openai"
import { result } from "~/lib/core"
import type { FuncResult } from "~/lib/core"
import { defaultLocale } from "~/lib/i18n"
import {
  parseWearProfileItem,
  subjectItems,
  fitItems,
  styleItems
} from "~/lib/wear"
import type { WearProfile, WearSuggestion } from "~/lib/wear"
import { temperatureUnit as tempUnit } from "~/lib/weather"
import type { TemperatureUnit, WeatherForecast } from "~/lib/weather"

const formatContent = (content: string[]) => {
  return content.join(" ")
}

const getForecastContent = (forecast: WeatherForecast): string => {
  const forecastNearestArea = forecast.nearest_area?.[0]
  const forecastWeather = forecast.weather?.[0]

  if (!forecastNearestArea || !forecastWeather) {
    return ""
  }

  const location = {
    areaName: forecastNearestArea.areaName?.[0]?.value ?? "",
    region: forecastNearestArea.region?.[0]?.value ?? "",
    country: forecastNearestArea.country?.[0]?.value ?? ""
  }

  const weather = {
    astronomy: forecastWeather.astronomy?.[0],
    avgTempC: forecastWeather.avgtempC,
    date: forecastWeather.date,
    hourly: Array.isArray(forecastWeather.hourly)
      ? forecastWeather.hourly.map((h) => {
          return {
            feelsLikeC: h.FeelsLikeC,
            windchillC: h.WindChillC,
            windGustKmph: h.WindGustKmph,
            chanceOfFog: h.chanceoffog,
            chanceOfFrost: h.chanceoffrost,
            chanceOfHighTemp: h.chanceofhightemp,
            chanceOfOvercast: h.chanceofovercast,
            chanceOfRain: h.chanceofrain,
            chanceOfRemainDry: h.chanceofremdry,
            chanceOfSnow: h.chanceofsnow,
            chanceOfSunshine: h.chanceofsunshine,
            chanceOfThunder: h.chanceofthunder,
            chanceOfWindy: h.chanceofwindy,
            cloudCover: h.cloudcover,
            humidity: h.humidity,
            precipitationMM: h.precipMM,
            pressure: h.pressure,
            tempC: h.tempC,
            time: h.time,
            uvIndex: h.uvIndex,
            visibilityKm: h.visibility,
            weatherDesc: h.weatherDesc?.[0]?.value ?? "",
            windspeedKmph: h.windspeedKmph
          }
        })
      : []
  }

  return JSON.stringify({ location, weather })
}

interface WearApiOptions {
  openAiApiKey: string
}

function createWearApi(options: WearApiOptions) {
  // TODO: Invariant check on apiKey

  const openai = new OpenAI({
    apiKey: options.openAiApiKey
  })

  return {
    fetchSuggestion: (
      profile: WearProfile,
      forecast: WeatherForecast,
      temperatureUnit?: TemperatureUnit,
      culture?: string
    ): Promise<FuncResult<WearSuggestion, Error>> => {
      const requestTemperatureUnit = temperatureUnit ?? tempUnit.celcius
      const requestCulture = culture ?? defaultLocale.culture

      const fit = parseWearProfileItem(profile.fit, fitItems)?.name ?? ""
      const style = parseWearProfileItem(profile.style, styleItems)?.name ?? ""

      const forecastContent = getForecastContent(forecast)

      return openai.chat.completions
        .create({
          messages: [
            {
              role: "system",
              content: formatContent([
                "You are a helpful fashion assistant. You are giving advice on what to wear based on the current local weather.",
                "You are informative in your advice, but as concise as possible providing 2-3 sentences at the most.",
                "You separately provide a third-person objective description of the subject wearing the clothes that you have advised so that they can picture themselves in them, but you are as concise as possible providing 1 sentence at the most.",
                "You separately provide a brief summary of the day's weather using simple keywords, but you are as concise as possible providing 10 keywords at the most. You don't include the temperature or other numbers in this weather summary, but you can in the advice above.",
                `You format the output as JSON. You use a consistent JSON schema, which is as follows: { "advice": "string", "description": "string", "weather": "string" }`
              ])
            },
            {
              role: "user",
              content: formatContent([
                "Based on the weather data below, give me suggestions on how warmly to dress, for example, wear a jumper or t-shirt, trousers, shorts or skirt, a light or warm coat, a scarf and gloves, if I should carry an umbrella, etc.",
                `I wear clothing typically made to fit ${fit}. I like to dress in a ${style} style. Assume I'll wear the same outfit the whole day.`,
                `In your response, use the hourly temperature data from the weather data below to explain your recommendation. Only use ${requestTemperatureUnit}, and respond in my preferred language, which is ${requestCulture}.`
              ])
            },
            {
              role: "user",
              content: forecastContent
            }
          ],
          model: "gpt-4-1106-preview",
          max_tokens: 150,
          seed: 1001,
          response_format: { type: "json_object" }
        })
        .then((completion) => {
          const content = completion.choices[0]?.message.content ?? ""

          if (!content) {
            // TODO: Custom error type
            throw new Error("Completion returned with no content.")
          }

          // TODO: Validate if the content is valid JSON and has the expected schema
          const suggestion = JSON.parse(content) as WearSuggestion

          console.log(suggestion)

          return result.ok(suggestion)
        })
        .catch((error) => {
          console.log(error)
          return result.error(
            new Error("Failed to fetch wear suggestion.", { cause: error })
          )
        })
    },
    generateImageFromSuggestion: (
      profile: WearProfile,
      suggestion: WearSuggestion
    ): Promise<FuncResult<string, Error>> => {
      const subject =
        parseWearProfileItem(profile.subject, subjectItems)?.name ?? ""
      const fit = parseWearProfileItem(profile.fit, fitItems)?.name ?? ""
      const style = parseWearProfileItem(profile.style, styleItems)?.name ?? ""

      return openai.images
        .generate({
          model: "dall-e-3",
          prompt: formatContent([
            `A colorful illustration in an anime style, in the foreground is a full-body pose of a ${subject} dressed in ${style} clothes that have been made to fit ${fit}, ${suggestion.description}`,
            `In the background is a scene of ${suggestion.weather}`
          ]),
          n: 1,
          size: "1024x1024"
        })
        .then((image) => {
          const url = image.data[0]?.url ?? ""

          if (!url) {
            // TODO: Custom error type
            throw new Error("Image returned with no URL.")
          }

          return result.ok(url)
        })
        .catch((error) => {
          // TODO: https://platform.openai.com/docs/guides/images/error-handling
          console.log(error)
          return result.error(
            new Error("Failed to generate image from suggestion.", {
              cause: error
            })
          )
        })
    }
  }
}

export { createWearApi }
