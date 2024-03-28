import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useRouteError,
  isRouteErrorResponse
} from "@remix-run/react"
import { useLocale, I18nProvider, RouterProvider } from "react-aria-components"

export function Layout({ children }: { children: React.ReactNode }) {
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
          <RouterProvider navigate={navigate}>{children}</RouterProvider>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </I18nProvider>
  )
}

export default function App() {
  return <Outlet />
}

// TODO: ErrorBoundary: https://remix.run/docs/en/main/guides/errors
// Also: https://remix.run/docs/en/main/route/error-boundary
// And: https://remix.run/docs/en/main/guides/not-found
export function ErrorBoundary() {
  const { locale, direction } = useLocale()
  const error = useRouteError()

  return (
    <html lang={locale} dir={direction}>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>
          {isRouteErrorResponse(error)
            ? `${error.status} ${error.statusText}`
            : error instanceof Error
              ? error.message
              : "Unknown Error"}
        </h1>
        <Scripts />
      </body>
    </html>
  )
}
