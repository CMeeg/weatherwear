import { result } from "~/lib/core"
import type { Nullable } from "~/lib/core"
import { defaultLocale } from "~/lib/i18n"

interface WeatherApiOptions {
  defaultLang: string
}

const defaultApiOptions: WeatherApiOptions = {
  defaultLang: defaultLocale.culture
}

const createWeatherApi = (options?: Partial<WeatherApiOptions>) => {
  const apiOptions: WeatherApiOptions = {
    ...defaultApiOptions,
    ...(options || {})
  }

  return {
    fetchForecast: async (location: string, lang?: string) => {
      let weatherResponse: Nullable<Response> = undefined
      const requestLang = lang ?? apiOptions.defaultLang

      try {
        // TODO: This service seems a little flaky (or maybe it's just my internet connection?) - use a retry policy?
        weatherResponse = await fetch(
          `https://wttr.in/${location}?lang=${requestLang}&format=j1`
        )
      } catch (error) {
        return result.error({
          message: `Failed to fetch weather for location "${location}", lang "${requestLang}".`,
          error
        })
      }

      try {
        const weather = await weatherResponse.json()

        return result.ok(weather)
      } catch (error) {
        return result.error({
          message: `Failed to parse weather for location "${location}", lang "${requestLang}".`,
          error
        })
      }
    }
  }
}

export { createWeatherApi }
