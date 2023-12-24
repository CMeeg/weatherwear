import { result } from "~/lib/core"
import type { FuncResult } from "~/lib/core"
import { defaultLocale } from "~/lib/i18n"
import type { WeatherForecast } from "~/lib/weather/weather.generated"

const createWeatherApi = () => {
  return {
    fetchForecast: (
      location: string,
      culture?: string
    ): Promise<FuncResult<WeatherForecast, unknown>> => {
      const requestCulture = culture ?? defaultLocale.culture

      return fetch(
        `https://wttr.in/${location}?lang=${requestCulture}&format=j1`
      )
        .then((response) => {
          return response.json()
        })
        .then((data) => {
          return result.ok(data as WeatherForecast)
        })
        .catch((error) => {
          return result.error({
            message: `Failed to fetch weather for location "${location}", culture "${requestCulture}".`,
            error
          })
        })
    }
  }
}

export { createWeatherApi }
