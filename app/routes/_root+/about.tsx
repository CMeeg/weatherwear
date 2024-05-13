import { json } from "@remix-run/node"
import type { MetaFunction } from "@remix-run/node"
import { getCdnUrl } from "~/lib/url"
import { Cloud } from "~/components/Cloud/Cloud"

export const loader = async () => {
  return json({
    meta: [
      { title: "WeatherWear" },
      {
        name: "description",
        content:
          "I can give you advice on what to wear today based on your local weather."
      },
      {
        tagName: "link",
        rel: "icon",
        href: getCdnUrl("/favicon.ico")
      }
    ]
  })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.meta) {
    return []
  }

  return data.meta
}

export default function About() {
  return (
    <Cloud className="wrapper">
      <h2>About WeatherWear</h2>
    </Cloud>
  )
}
