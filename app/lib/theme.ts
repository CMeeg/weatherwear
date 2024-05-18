import { useForecastWeather } from "~/lib/forecast/weather"

const useTheme = () => {
  const weather = useForecastWeather()

  if (typeof weather?.theme !== "undefined") {
    return weather.theme
  }

  const hour = new Date().getHours()

  if (hour >= 21 && hour < 6) {
    return "night"
  } else if (hour >= 18) {
    return "evening"
  } else if (hour >= 9) {
    return "day"
  } else {
    return "morning"
  }
}

export { useTheme }
