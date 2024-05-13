import { Link } from "@remix-run/react"
import { clsx } from "clsx"
import { useForecastWeather } from "~/lib/forecast/weather"
import { getCdnUrl } from "~/lib/url"
import css from "./Header.module.css"

interface HeaderIconProps {
  weather: ReturnType<typeof useForecastWeather>
}

function HeaderIcon({ weather }: HeaderIconProps) {
  if (weather) {
    return (
      <img
        src={getCdnUrl(weather.icon_url)}
        width="80"
        height="80"
        alt={weather.codename}
      />
    )
  }

  return (
    <svg>
      <use href="/img/sprite.svg#weather-app" />
    </svg>
  )
}

interface HeaderProps {
  className?: string
}

function Header({ className }: HeaderProps) {
  const weather = useForecastWeather()

  return (
    <header className={clsx([css.header, className])}>
      <h1 className={css.weatherwear}>
        <Link to="/" className={css.text}>
          <span className="visually-hidden">WeatherWear</span>
          <svg>
            <use href="/img/sprite.svg#weatherwear" />
          </svg>
        </Link>
        <span className={css.icon}>
          <HeaderIcon weather={weather} />
        </span>
      </h1>
    </header>
  )
}

export { Header }
