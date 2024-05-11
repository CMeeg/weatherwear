import type { WeatherForecast } from "~/lib/weather/wttr.generated"

const temperatureUnit = {
  celcius: "celcius",
  fahrenheit: "fahrenheit"
} as const

type TemperatureUnit = keyof typeof temperatureUnit

const weatherCodename = {
  cloudy: "cloudy",
  fog: "fog",
  heavy_rain: "heavy_rain",
  heavy_showers: "heavy_showers",
  heavy_snow: "heavy_snow",
  heavy_snow_showers: "heavy_snow_showers",
  light_rain: "light_rain",
  light_showers: "light_showers",
  light_sleet: "light_sleet",
  light_sleet_showers: "light_sleet_showers",
  light_snow: "light_snow",
  light_snow_showers: "light_snow_showers",
  partly_cloudy: "partly_cloudy",
  sunny: "sunny",
  thundery_heavy_rain: "thundery_heavy_rain",
  thundery_showers: "thundery_showers",
  thundery_snow_showers: "thundery_snow_showers",
  very_cloudy: "very_cloudy"
} as const

type WeatherCodename = keyof typeof weatherCodename

const weatherIcon: Record<WeatherCodename, string> = {
  [weatherCodename.cloudy]: "cloudy.svg",
  [weatherCodename.fog]: "fog.svg",
  [weatherCodename.heavy_rain]: "rain.svg",
  [weatherCodename.heavy_showers]: "rain.svg",
  [weatherCodename.heavy_snow]: "snow.svg",
  [weatherCodename.heavy_snow_showers]: "snow.svg",
  [weatherCodename.light_rain]: "drizzle.svg",
  [weatherCodename.light_showers]: "drizzle.svg",
  [weatherCodename.light_sleet]: "sleet.svg",
  [weatherCodename.light_sleet_showers]: "sleet.svg",
  [weatherCodename.light_snow]: "snow.svg",
  [weatherCodename.light_snow_showers]: "snow.svg",
  [weatherCodename.partly_cloudy]: "partly-cloudy-day.svg",
  [weatherCodename.sunny]: "clear-day.svg",
  [weatherCodename.thundery_heavy_rain]: "thunderstorm.svg",
  [weatherCodename.thundery_showers]: "thunderstorm.svg",
  [weatherCodename.thundery_snow_showers]: "thunderstorm.svg",
  [weatherCodename.very_cloudy]: "cloudy.svg"
}

type WeatherTheme = "sun" | "cloud" | "rain" | "snow" | "storm"

const weatherTheme: Record<WeatherCodename, WeatherTheme> = {
  [weatherCodename.cloudy]: "cloud",
  [weatherCodename.fog]: "cloud",
  [weatherCodename.heavy_rain]: "rain",
  [weatherCodename.heavy_showers]: "rain",
  [weatherCodename.heavy_snow]: "snow",
  [weatherCodename.heavy_snow_showers]: "snow",
  [weatherCodename.light_rain]: "rain",
  [weatherCodename.light_showers]: "rain",
  [weatherCodename.light_sleet]: "rain",
  [weatherCodename.light_sleet_showers]: "rain",
  [weatherCodename.light_snow]: "snow",
  [weatherCodename.light_snow_showers]: "snow",
  [weatherCodename.partly_cloudy]: "cloud",
  [weatherCodename.sunny]: "sun",
  [weatherCodename.thundery_heavy_rain]: "storm",
  [weatherCodename.thundery_showers]: "storm",
  [weatherCodename.thundery_snow_showers]: "storm",
  [weatherCodename.very_cloudy]: "cloud"
}

const weatherSymbol: Record<WeatherCodename, string> = {
  [weatherCodename.cloudy]: "☁️",
  [weatherCodename.fog]: "🌫",
  [weatherCodename.heavy_rain]: "🌧",
  [weatherCodename.heavy_showers]: "🌧",
  [weatherCodename.heavy_snow]: "❄️",
  [weatherCodename.heavy_snow_showers]: "❄️",
  [weatherCodename.light_rain]: "🌦",
  [weatherCodename.light_showers]: "🌦",
  [weatherCodename.light_sleet]: "🌧",
  [weatherCodename.light_sleet_showers]: "🌧",
  [weatherCodename.light_snow]: "🌨",
  [weatherCodename.light_snow_showers]: "🌨",
  [weatherCodename.partly_cloudy]: "⛅️",
  [weatherCodename.sunny]: "☀️",
  [weatherCodename.thundery_heavy_rain]: "🌩",
  [weatherCodename.thundery_showers]: "⛈",
  [weatherCodename.thundery_snow_showers]: "⛈",
  [weatherCodename.very_cloudy]: "☁️"
}

const weatherCode: Record<string, WeatherCodename> = {
  "113": weatherCodename.sunny,
  "116": weatherCodename.partly_cloudy,
  "119": weatherCodename.cloudy,
  "122": weatherCodename.very_cloudy,
  "143": weatherCodename.fog,
  "176": weatherCodename.light_showers,
  "179": weatherCodename.light_sleet_showers,
  "182": weatherCodename.light_sleet,
  "185": weatherCodename.light_sleet,
  "200": weatherCodename.thundery_showers,
  "227": weatherCodename.light_snow,
  "230": weatherCodename.heavy_snow,
  "248": weatherCodename.fog,
  "260": weatherCodename.fog,
  "263": weatherCodename.light_showers,
  "266": weatherCodename.light_rain,
  "281": weatherCodename.light_sleet,
  "284": weatherCodename.light_sleet,
  "293": weatherCodename.light_rain,
  "296": weatherCodename.light_rain,
  "299": weatherCodename.heavy_showers,
  "302": weatherCodename.heavy_rain,
  "305": weatherCodename.heavy_showers,
  "308": weatherCodename.heavy_rain,
  "311": weatherCodename.light_sleet,
  "314": weatherCodename.light_sleet,
  "317": weatherCodename.light_sleet,
  "320": weatherCodename.light_snow,
  "323": weatherCodename.light_snow_showers,
  "326": weatherCodename.light_snow_showers,
  "329": weatherCodename.heavy_snow,
  "332": weatherCodename.heavy_snow,
  "335": weatherCodename.heavy_snow_showers,
  "338": weatherCodename.heavy_snow,
  "350": weatherCodename.light_sleet,
  "353": weatherCodename.light_showers,
  "356": weatherCodename.heavy_showers,
  "359": weatherCodename.heavy_rain,
  "362": weatherCodename.light_sleet_showers,
  "365": weatherCodename.light_sleet_showers,
  "368": weatherCodename.light_snow_showers,
  "371": weatherCodename.heavy_snow_showers,
  "374": weatherCodename.light_sleet_showers,
  "377": weatherCodename.light_sleet,
  "386": weatherCodename.thundery_showers,
  "389": weatherCodename.thundery_heavy_rain,
  "392": weatherCodename.thundery_snow_showers,
  "395": weatherCodename.heavy_snow_showers
} as const

function getWeatherIconUrl(codename: WeatherCodename) {
  return `/img/weather/${weatherIcon[codename]}`
}

export {
  temperatureUnit,
  weatherCodename,
  weatherIcon,
  weatherSymbol,
  weatherCode,
  weatherTheme,
  getWeatherIconUrl
}

export type { TemperatureUnit, WeatherForecast, WeatherCodename }
