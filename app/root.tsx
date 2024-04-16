import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate,
  useRouteError,
  isRouteErrorResponse
} from "@remix-run/react"
import type { LinksFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { getCdnUrl } from "~/lib/url"
import { getClientEnv } from "~/lib/env.server"
import { useNonce } from "~/components/NonceContext"
import { AppInsightsClient } from "~/components/AppInsights/Client"
import { ClientEnvScript } from "~/components/ClientEnvScript"
import { useLocale, I18nProvider, RouterProvider } from "react-aria-components"
import "open-props/normalize.min.css"
import "~/styles/base.css"

export const links: LinksFunction = () => {
  const links: ReturnType<LinksFunction> = []

  const cdnUrl = getCdnUrl("", false)

  if (cdnUrl.length > 0) {
    links.push({
      rel: "preconnect",
      href: cdnUrl
    })
  }

  return links
}

export async function loader() {
  return json({
    env: getClientEnv()
  })
}

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce()

  const data = useLoaderData<typeof loader>()

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
            <AppInsightsClient>{children}</AppInsightsClient>
          </RouterProvider>
          <ClientEnvScript nonce={nonce} env={data.env} />
          <ScrollRestoration nonce={nonce} />
          <Scripts nonce={nonce} />
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
  const nonce = useNonce()

  const { locale, direction } = useLocale()

  const error = useRouteError()

  return (
    <html lang={locale} dir={direction}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <AppInsightsClient>
          <h1>
            Error boundary says:{" "}
            {isRouteErrorResponse(error)
              ? `${error.status} ${error.statusText}`
              : error instanceof Error
                ? error.message
                : "Unknown Error"}
          </h1>
        </AppInsightsClient>
        <Scripts nonce={nonce} />
      </body>
    </html>
  )
}
