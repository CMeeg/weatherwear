import { Link } from "@remix-run/react"
import { useForecastWeather } from "~/lib/forecast/weather"
import { getCdnUrl } from "~/lib/url"
import css from "./Header.module.css"

function Header() {
  const weather = useForecastWeather()

  return (
    <header className={css.header}>
      <h1 className={css.weatherwear}>
        <Link to="/" className={css.text}>
          <span className="visually-hidden">WeatherWear</span>
          <svg>
            <use href="/img/sprite.svg#weatherwear" />
          </svg>
        </Link>
        <span className={css.icon}>
          <img
            src={getCdnUrl(weather.icon_url)}
            width="80"
            height="80"
            alt="Clear Day"
          />
        </span>
      </h1>
    </header>
  )
}

export { Header }
