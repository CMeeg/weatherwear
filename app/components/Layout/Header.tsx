import { Link } from "@remix-run/react"
import { getCdnUrl } from "~/lib/url"
import css from "./Header.module.css"

function Header() {
  return (
    <header className={css.header}>
      <h1 className={css.weatherwear}>
        <span className={css.weather}>
          <img
            src={getCdnUrl("/img/weather/clear-day.svg")}
            width="80"
            height="80"
            alt="Clear Day"
          />
        </span>
        <Link to="/">weatherwear</Link>
      </h1>
    </header>
  )
}

export { Header }
