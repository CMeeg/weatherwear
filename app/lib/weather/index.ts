import type { WeatherForecast } from "~/lib/weather/openweathermap.generated"

const temperatureUnit = {
  celcius: "celcius",
  fahrenheit: "fahrenheit"
} as const

type TemperatureUnit = keyof typeof temperatureUnit

// TODO: Align with OpenWeather https://openweathermap.org/weather-conditions
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

// https://openweathermap.org/weather-conditions
const weatherId: Record<string, WeatherCodename> = {
  // Group 2xx: Thunderstorm
  "200": weatherCodename.thundery_showers,
  "201": weatherCodename.thundery_showers,
  "202": weatherCodename.thundery_heavy_rain,
  "210": weatherCodename.thundery_showers,
  "211": weatherCodename.thundery_showers,
  "212": weatherCodename.thundery_heavy_rain,
  "221": weatherCodename.thundery_heavy_rain,
  "230": weatherCodename.thundery_showers,
  "231": weatherCodename.thundery_showers,
  "232": weatherCodename.thundery_heavy_rain,
  // Group 3xx: Drizzle
  "300": weatherCodename.light_rain,
  "301": weatherCodename.light_rain,
  "302": weatherCodename.light_rain,
  "310": weatherCodename.light_rain,
  "311": weatherCodename.light_rain,
  "312": weatherCodename.light_rain,
  "313": weatherCodename.light_rain,
  "314": weatherCodename.light_rain,
  "321": weatherCodename.light_rain,
  // Group 5xx: Rain
  "500": weatherCodename.light_rain,
  "501": weatherCodename.light_rain,
  "502": weatherCodename.heavy_rain,
  "503": weatherCodename.heavy_rain,
  "504": weatherCodename.heavy_rain,
  "511": weatherCodename.light_snow_showers,
  "520": weatherCodename.light_rain,
  "521": weatherCodename.light_rain,
  "522": weatherCodename.heavy_rain,
  "531": weatherCodename.heavy_rain,
  // Group 6xx: Snow
  "600": weatherCodename.light_snow,
  "601": weatherCodename.light_snow,
  "602": weatherCodename.heavy_snow,
  "611": weatherCodename.light_sleet,
  "612": weatherCodename.light_snow_showers,
  "613": weatherCodename.light_sleet_showers,
  "615": weatherCodename.light_snow_showers,
  "616": weatherCodename.light_snow_showers,
  "620": weatherCodename.light_snow_showers,
  "621": weatherCodename.light_snow_showers,
  "622": weatherCodename.heavy_snow_showers,
  // Group 7xx: Atmosphere
  "701": weatherCodename.fog,
  "711": weatherCodename.fog,
  "721": weatherCodename.fog,
  "731": weatherCodename.fog,
  "741": weatherCodename.fog,
  "751": weatherCodename.fog,
  "761": weatherCodename.fog,
  "762": weatherCodename.fog,
  "771": weatherCodename.thundery_heavy_rain,
  "781": weatherCodename.thundery_heavy_rain,
  // Group 800: Clear
  "800": weatherCodename.sunny,
  // Group 80x: Clouds
  "801": weatherCodename.partly_cloudy,
  "802": weatherCodename.partly_cloudy,
  "803": weatherCodename.cloudy,
  "804": weatherCodename.very_cloudy
} as const

function getWeatherIconUrl(codename: WeatherCodename) {
  return `/img/weather/${weatherIcon[codename]}`
}

export {
  temperatureUnit,
  weatherCodename,
  weatherIcon,
  weatherSymbol,
  weatherId,
  weatherTheme,
  getWeatherIconUrl
}

export type { TemperatureUnit, WeatherForecast, WeatherCodename }
