import { vitePlugin as remix } from "@remix-run/dev"
import { defineConfig } from "vite"
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
