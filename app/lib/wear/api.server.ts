import OpenAI from "openai"
import { result } from "~/lib/core"
import type { FuncResult } from "~/lib/core"
import { defaultLocale } from "~/lib/i18n"
import type { WearProfile } from "~/lib/wear"
import { temperatureUnit as tempUnit } from "~/lib/weather"
import type { TemperatureUnit, WeatherForecast } from "~/lib/weather"

const formatContent = (content: string[]) => {
  return content.join(" ")
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
    fetchSuggestions: (
      profile: WearProfile,
      forecast: WeatherForecast,
      temperatureUnit?: TemperatureUnit,
      culture?: string
    ): Promise<FuncResult<string, unknown>> => {
      const requestTemperatureUnit = temperatureUnit ?? tempUnit.celcius
      const requestCulture = culture ?? defaultLocale.culture

      return openai.chat.completions
        .create({
          messages: [
            {
              role: "system",
              content: formatContent([
                "You are a helpful fashion assistant.",
                "You are giving advice on what to wear based on the current local weather.",
                "You keep your advice as concise as possible, 2-3 sentences at the most.",
                `You reply in the user's preferred language, which is ${requestCulture}.`
              ])
            },
            {
              role: "user",
              content: formatContent([
                "Based on the weather data below, give me suggestions on how warmly to dress, for example, wear a jumper/t-shirt, trousers/shorts/skirt, a light or warm coat, a scarf and gloves, if I should carry an umbrella, etc.",
                "In your response, use temperature data from the weather data below throughout the day to explain your recommendation.",
                "Assume I'll wear the same outfit the whole day.",
                `I wear clothing typically made to fit ${profile.fit}.`,
                `I like to dress in a ${profile.style} style.`,
                `Only use ${requestTemperatureUnit}.`,
                `Respond in my preferred language, which is ${requestCulture}.`
              ])
            },
            {
              role: "user",
              content: JSON.stringify(forecast)
            }
          ],
          model: "gpt-4-1106-preview",
          max_tokens: 150
        })
        .then((completion) => {
          const content = completion.choices[0]?.message.content ?? ""

          if (!content) {
            // TODO: Custom error type
            throw new Error("Completion returned with no content.")
          }

          return result.ok(content)
        })
        .catch((error) => {
          return result.error({
            message: "Failed to fetch wear suggestions.",
            error
          })
        })
    },
    generateImageFromSuggestions: (
      profile: WearProfile,
      suggestions: string
    ): Promise<FuncResult<string, unknown>> => {
      return openai.images
        .generate({
          model: "dall-e-3",
          prompt: formatContent([
            "You are dressing yourself based on the following suggestions:",
            suggestions,
            `In the foreground is a colourful cartoonish illustration of 1 ${profile.subject} dressed in ${profile.style} style clothes made for ${profile.fit}.`,
            "DO NOT show the suggestions in the illustration.",
            "There is NOTHING in the background.",
            `Include ONLY 1 ${profile.subject} in the foreground of the image.`,
            "DO NOT include any other features, adornments or text in the foreground or background."
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
          return result.error({
            message: "Failed to generate image from suggestions.",
            error
          })
        })
    }
  }
}

export { createWearApi }
