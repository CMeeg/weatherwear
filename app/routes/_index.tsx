import type { MetaFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import OpenAI from "openai"

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" }
  ]
}

const formatContent = (content: string[]) => {
  return content.join(" ")
}

export const loader = async () => {
  const location = "witney,uk"
  const lang = "en"

  const weatherResponse = await fetch(
    `https://wttr.in/${location}?lang=${lang}&format=j1`
  )

  const weather = await weatherResponse.json()

  const openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY
  })

  const gender = "female"
  const style = "casual"
  const temperatureUnit = "Celcius"
  const culture = "en-GB"

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: formatContent([
          "You are a helpful fashion assistant.",
          "You are giving advice on what to wear based on the current local weather.",
          "You keep your advice as concise as possible, 2-3 sentences at the most."
        ])
      },
      {
        role: "user",
        content: formatContent([
          "Based on the weather data below, give me suggestions on how warmly to dress, for example, wear jumper/t-shirt, trousers/shorts/skirt, a light or warm coat, a scarf and gloves, if I should carry an umbrella, etc.",
          "In your response, use temperature data from the weather data below throughout the day to explain your recommendation.",
          "Assume I'll wear the same outfit the whole day.",
          `My gender is ${gender}.`,
          `I like to dress in a ${style} style.`,
          `Only use ${temperatureUnit}.`,
          `Respond in my preferred language, which is ${culture}.`
        ])
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

  const subject = "human"

  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: formatContent([
      "You have been given this description for what to wear today:",
      text ?? "",
      `The foreground of the image is an illustration of 1 ${gender} ${subject} who has dressed in a ${style} style matching the description.`,
      "DO NOT include the weather description in the illustration.",
      "There is NOTHING in the background of the image.",
      `Include ONLY 1 ${subject} as the 1 and ONLY thing in the image.`,
      "DO NOT include any other features, adornments or text in the illustration."
    ]),
    n: 1,
    size: "1024x1024"
  })

  const image_url = image.data[0].url

  return { text, image_url }
}

export default function Index() {
  const { text, image_url } = useLoaderData<typeof loader>()

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <p>
        <img src={image_url} alt="" style={{ height: "80vh" }} />
        <br />
        {text ?? "No response."}
      </p>
    </div>
  )
}
