import { Link } from "@remix-run/react"

function Header() {
  return (
    <header>
      <h1>
        <Link to="/">WeatherWear</Link>
      </h1>
    </header>
  )
}

export { Header }
