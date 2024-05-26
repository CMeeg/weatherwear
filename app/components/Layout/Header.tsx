import { Link, useLocation } from "@remix-run/react"
import { clsx } from "clsx"
import { useForecastWeather } from "~/lib/forecast/weather"
import { getCdnUrl } from "~/lib/url"
import css from "./Header.module.css"

const DefaultIcon = () => (
  <svg>
    <use href="/img/sprite.svg#weather-app" />
  </svg>
)

const WeatherIcon = () => {
  const weather = useForecastWeather()

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

  return <DefaultIcon />
}

function HeaderIcon() {
  const location = useLocation()

  if (location.pathname.startsWith("/forecast/")) {
    return <WeatherIcon />
  }

  return <DefaultIcon />
}

interface HeaderProps {
  className?: string
}

function Header({ className }: HeaderProps) {
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
          <HeaderIcon />
        </span>
      </h1>
    </header>
  )
}

export { Header }
