import type { WeatherForecast } from "~/lib/weather/weather.generated"

const temperatureUnit = {
  celcius: "celcius",
  fahrenheit: "fahrenheit"
} as const

type TemperatureUnit = keyof typeof temperatureUnit

export { temperatureUnit }

export type { TemperatureUnit, WeatherForecast }
