import { unstable_vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
// This is only an issue in the Remix monorepo, this should lint properly once
// you've created an app from this template and this comment can be removed
// eslint-disable-next-line import/no-unresolved
import tsconfigPaths from "vite-tsconfig-paths"
import localesPlugin from "@react-aria/optimize-locales-plugin"
import { flatRoutes } from "remix-flat-routes"

export default defineConfig({
  plugins: [
    remix({
      // ignore all files in routes folder to prevent default remix convention from picking up routes
      ignoredRouteFiles: ["**/*"],
      routes: async (defineRoutes) => {
        return flatRoutes("routes", defineRoutes)
      }
    }),
    // Don't include any locale strings in the client JS bundle.
    { ...localesPlugin.vite({ locales: [] }), enforce: "pre" },
    tsconfigPaths()
  ]
})
