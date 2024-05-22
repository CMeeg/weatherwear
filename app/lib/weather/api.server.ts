import { result } from "~/lib/core"
import type { FuncResult } from "~/lib/core"
import { defaultLocale } from "~/lib/i18n"
import type { WeatherForecast } from "~/lib/weather/openweathermap.generated"
import type { City } from "~/lib/places"

const createWeatherApi = () => {
  return {
    fetchForecast: async (
      city: City,
      culture?: string
    ): Promise<FuncResult<WeatherForecast, Error>> => {
      const requestCulture = culture ?? defaultLocale.culture

      const weatherUrl = new URL("https://api.openweathermap.org")
      weatherUrl.pathname = "data/2.5/forecast"
      weatherUrl.search = new URLSearchParams({
        id: city.cityId.toString(),
        units: "metric",
        cnt: "8",
        lang: requestCulture,
        appid: process.env.OPENWEATHER_API_KEY
      }).toString()

      try {
        const weatherResponse = await fetch(weatherUrl.toString())

        if (!weatherResponse.ok) {
          throw new Error(
            `Request returned status ${weatherResponse.status}: ${weatherResponse.statusText}`
          )
        }

        const weather = (await weatherResponse.json()) as WeatherForecast

        return result.ok(weather)
      } catch (error) {
        return result.error(
          new Error(
            `Failed to fetch weather for location "${location}", culture "${requestCulture}".`,
            { cause: error }
          )
        )
      }
    }
  }
}

export { createWeatherApi }
