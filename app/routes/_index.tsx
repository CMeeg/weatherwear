import type { MetaFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import OpenAI from "openai"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ]
}

export const loader = async () => {
  const location = "witney,uk"
  const lang = "en"

  const weatherResponse = await fetch(
    `https://wttr.in/${location}?lang=${lang}&format=j1`
  )

  const weather = await weatherResponse.json()

  const temperatureUnit = "Celcius"
  const subject = "male person"
  const culture = "en-GB"

  const openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY
  })

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are helpful fashion assistant giving advice to a ${subject} on what to wear based on their current local weather. You will provide advice in their preferred language culture, which is ${culture}.`
      },
      {
        role: "user",
        content: `Based the weather data below,
give me suggestions on how warmly to dress,
ie pants or shorts, a light jacket or a warm jacket,
a scarf and gloves or not, if I should carry an umbrella, etc.
In your response, use temperature data from the weather data below
throughout the day to explain your recommendation.
Be as concise as possible.
Assume I'll wear the same thing the whole day.
Do not use a bulleted list.
Use 2-3 sentences.
Only use ${temperatureUnit}.`.replaceAll("\n", " ")
      },
      {
        role: "user",
        content: JSON.stringify(weather)
      }
    ],
    model: "gpt-4-1106-preview",
    max_tokens: 150
  })

  const text = completion.choices[0].message.content

  return { message: text }
}

export default function Index() {
  const { message } = useLoaderData<typeof loader>()

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <p>{message ?? "No response."}</p>
    </div>
  )
}
