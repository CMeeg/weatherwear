import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigate
} from "@remix-run/react"
import type { LinksFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { defaultLocale } from "./lib/i18n"
import { getCdnUrl } from "~/lib/url"
import { getClientEnv } from "~/lib/env.server"
import { useNonce } from "~/components/NonceContext"
import { useForecastWeather } from "~/lib/forecast/weather"
import { AppInsightsClient } from "~/components/AppInsights/Client"
import { DefaultLayout } from "~/components/Layout/DefaultLayout"
import { ClientEnvScript } from "~/components/ClientEnvScript"
import { I18nProvider, RouterProvider } from "react-aria-components"
import "~/styles/global.css"

export const links: LinksFunction = () => {
  const links: ReturnType<LinksFunction> = [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    {
      rel: "preconnect",
      href: "https://fonts.gstatic.com",
      crossOrigin: "anonymous"
    },
    {
      href: "https://fonts.googleapis.com/css2?family=Sen:wght@400..800&display=swap",
      rel: "stylesheet"
    }
  ]

  const cdnUrl = getCdnUrl("", false)

  if (cdnUrl.length > 0) {
    links.push({
      rel: "preconnect",
      href: cdnUrl
    })
  }

  links.push({
    rel: "preload",
    as: "image",
    type: "image/svg+xml",
    href: "/img/sprite.svg"
  })

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

  const { culture, direction } = defaultLocale
  const navigate = useNavigate()

  const weather = useForecastWeather()

  return (
    <I18nProvider locale={culture}>
      <html lang={culture} dir={direction} data-theme={weather?.theme}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <Meta />
          <Links />
        </head>
        <body>
          <RouterProvider navigate={navigate}>
            <AppInsightsClient>
              <DefaultLayout>{children}</DefaultLayout>
            </AppInsightsClient>
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
// export function ErrorBoundary() {
//   const nonce = useNonce()

//   const { culture, direction } = defaultLocale

//   const error = useRouteError()

//   return (
//     <html lang={culture} dir={direction}>
//       <head>
//         <meta charSet="utf-8" />
//         <meta name="viewport" content="width=device-width, initial-scale=1" />
//         <title>Oops!</title>
//         <Meta />
//         <Links />
//       </head>
//       <body>
//         <AppInsightsClient>
//           <h2>
//             Error boundary says:{" "}
//             {isRouteErrorResponse(error)
//               ? `${error.status} ${error.statusText}`
//               : error instanceof Error
//                 ? error.message
//                 : "Unknown Error"}
//           </h2>
//         </AppInsightsClient>
//         <Scripts nonce={nonce} />
//       </body>
//     </html>
//   )
// }
