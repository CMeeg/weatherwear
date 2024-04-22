import { Link } from "@remix-run/react"
import css from "./Header.module.css"

function Header() {
  return (
    <header className={css.header}>
      <h1>
        <Link to="/">WeatherWear</Link>
      </h1>
    </header>
  )
}

export { Header }
