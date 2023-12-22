import {
  Meta,
  Links,
  useNavigate,
  Outlet,
  ScrollRestoration,
  Scripts,
  LiveReload
} from "@remix-run/react"
import { useLocale, I18nProvider, RouterProvider } from "react-aria-components"

export default function App() {
  const { locale, direction } = useLocale()
  const navigate = useNavigate()

  return (
    <I18nProvider locale={locale}>
      <html lang={locale} dir={direction}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <RouterProvider navigate={navigate}>
            <Outlet />
          </RouterProvider>
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </body>
      </html>
    </I18nProvider>
  )
}
