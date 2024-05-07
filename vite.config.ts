import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import localesPlugin from "@react-aria/optimize-locales-plugin"
import { flatRoutes } from "remix-flat-routes"
import { defaultLocale } from "./app/lib/i18n"

let base = process.env.CDN_URL ?? "/"
if (!base.endsWith("/")) {
  base = `${base}/`
}

export default defineConfig({
  base,
  plugins: [
    remix({
      // Ignore all files in routes folder to prevent default remix convention from picking up routes
      ignoredRouteFiles: ["**/*"],
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes)
      }
    }),
    // TODO: Don't include any locale strings in the client JS bundle
    {
      ...localesPlugin.vite({ locales: [defaultLocale.culture] }),
      enforce: "pre"
    },
    tsconfigPaths()
  ]
})
