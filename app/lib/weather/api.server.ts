import countryCodeLookup from "country-code-lookup"
import { result } from "~/lib/core"
import type { FuncResult } from "~/lib/core"
import { defaultLocale } from "~/lib/i18n"
import type { WeatherForecast } from "~/lib/weather/wttr.generated"

const transformLocation = (location: string): string => {
  if (!location) {
    return ""
  }

  const parts = location.split(",")

  if (parts.length < 2) {
    return location
  }

  // We will assume that the first part is the city
  const city = parts[0]?.trim() ?? ""

  // We will assume that the last part is the country
  let country = parts.pop()?.trim() ?? ""

  if (country) {
    // Try to convert the country to an ISO2 code, otherwise use the original value

    const result = countryCodeLookup.byCountry(country)

    if (result) {
      country = result.iso2
    }
  } else {
    return city
  }

  // Some locations includes states/regions, which can also cause issues so we are just going to take the city and country

  return [city, country].join(",")
}

const createWeatherApi = () => {
  return {
    fetchForecast: async (
      location: string,
      culture?: string
    ): Promise<FuncResult<WeatherForecast, Error>> => {
      const requestCulture = culture ?? defaultLocale.culture

      const weatherUrl = new URL("https://wttr.in")
      weatherUrl.pathname = transformLocation(location)
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
          !location.toLowerCase().includes(areaName.toLowerCase())
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
