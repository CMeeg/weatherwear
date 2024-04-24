import { Link } from "@remix-run/react"
import css from "./Header.module.css"

function Header() {
  return (
    <header className={css.header}>
      <h1 className={css.weatherwear}>
        <img
          src="/img/weather/clear-day.svg"
          width="80"
          height="80"
          alt="Clear Day"
        />
        <Link to="/">weatherwear</Link>
      </h1>
    </header>
  )
}

export { Header }
