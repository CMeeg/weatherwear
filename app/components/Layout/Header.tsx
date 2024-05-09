import { Link } from "@remix-run/react"
import { getCdnUrl } from "~/lib/url"
import css from "./Header.module.css"

function Header() {
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
            src={getCdnUrl("/img/weather/clear-day.svg")}
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
