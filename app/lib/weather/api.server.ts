import { result } from "~/lib/core"
import type { FuncResult } from "~/lib/core"
import { defaultLocale } from "~/lib/i18n"
import type { WeatherForecast } from "~/lib/weather/wttr.generated"

const createWeatherApi = () => {
  return {
    fetchForecast: async (
      location: string,
      culture?: string
    ): Promise<FuncResult<WeatherForecast, Error>> => {
      const requestCulture = culture ?? defaultLocale.culture

      const locationLower = location.toLowerCase()

      const weatherUrl = new URL("https://wttr.in")

      // `, ` can cause locations to not match when but removing the space can fix it for some reason
      weatherUrl.pathname = locationLower.replaceAll(", ", ",")
      weatherUrl.search = new URLSearchParams({
        lang: requestCulture,
        format: "j1"
      }).toString()

      try {
        const weatherResponse = await fetch(weatherUrl.toString())

        if (!weatherResponse.ok) {
          throw new Error(
            `Request returned status ${weatherResponse.status}: ${weatherResponse.statusText}`
          )
        }

        const weather = (await weatherResponse.json()) as WeatherForecast
        const areaName = weather.nearest_area?.[0]?.areaName?.[0]?.value ?? ""

        if (
          !areaName.length ||
          !locationLower.includes(areaName.toLowerCase())
        ) {
          throw new Error(
            `Nearest area "${areaName}" does not appear to match location "${location}".`
          )
        }

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
