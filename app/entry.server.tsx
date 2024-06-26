import { PassThrough } from "node:stream"
import type { AppLoadContext, EntryContext } from "@remix-run/node"
import { createReadableStreamFromReadable } from "@remix-run/node"
import { RemixServer } from "@remix-run/react"
import { isbot } from "isbot"
import { renderToPipeableStream } from "react-dom/server"
import { parseProcessEnv, getClientEnv } from "~/lib/env.server"
import { NonceContext } from "~/components/NonceContext"
import { getLocalizationScript } from "react-aria-components/i18n"
import { defaultLocale } from "~/lib/i18n"

const ABORT_DELAY = 30_000

parseProcessEnv()
global.ENV = getClientEnv()

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  const nonce = loadContext.cspNonce

  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </NonceContext.Provider>,
      {
        onAllReady() {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
        nonce
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  const nonce = loadContext.cspNonce

  const { culture } = defaultLocale

  return new Promise((resolve, reject) => {
    let shellRendered = false
    const { pipe, abort } = renderToPipeableStream(
      <NonceContext.Provider value={nonce}>
        <RemixServer
          context={remixContext}
          url={request.url}
          abortDelay={ABORT_DELAY}
        />
      </NonceContext.Provider>,
      {
        bootstrapScriptContent: getLocalizationScript(culture),
        onShellReady() {
          shellRendered = true
          const body = new PassThrough()
          const stream = createReadableStreamFromReadable(body)

          responseHeaders.set("Content-Type", "text/html")

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          )

          pipe(body)
        },
        onShellError(error: unknown) {
          reject(error)
        },
        onError(error: unknown) {
          responseStatusCode = 500
          // Log streaming rendering errors from inside the shell.  Don't log
          // errors encountered during initial shell rendering since they'll
          // reject and get logged in handleDocumentRequest.
          if (shellRendered) {
            console.error(error)
          }
        },
        nonce
      }
    )

    setTimeout(abort, ABORT_DELAY)
  })
}

function isBotRequest(userAgent: string | null) {
  if (!userAgent) {
    return false
  }

  return isbot(userAgent)
}

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext
) {
  return isBotRequest(request.headers.get("user-agent"))
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
        loadContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        remixContext,
        loadContext
      )
}
