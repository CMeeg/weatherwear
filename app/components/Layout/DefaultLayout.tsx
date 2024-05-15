import { useLocation } from "@remix-run/react"
import { clsx } from "clsx"
import { Header } from "./Header"
import { Footer } from "./Footer"
import css from "./DefaultLayout.module.css"

function DefaultLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div
      className={clsx([css.canvas, location.pathname === "/" ? "home" : null])}
    >
      <Header className={css.header} />
      <main role="main" className={css.main}>
        {children}
      </main>
      <Footer className={css.footer} />
    </div>
  )
}

export { DefaultLayout }
