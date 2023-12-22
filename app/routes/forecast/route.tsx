import { json } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import OpenAI from "openai"
import { createWeatherApi } from "~/lib/weather"
import { defaultLocale } from "~/lib/i18n"

const formatContent = (content: string[]) => {
  return content.join(" ")
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const submissionData = new URL(request.url).searchParams

  const submission = {
    location: submissionData.get("location"),
    style: submissionData.get("style"),
    fit: submissionData.get("fit"),
    subject: submissionData.get("subject")
  }

  // TODO: Form validation
  if (
    !submission.location ||
    !submission.style ||
    !submission.fit ||
    !submission.subject
  ) {
    // TODO: Return validation errors
    return json({
      submission,
      text: null,
      image_url: null
    })
  }

  const [weather, weatherError] = await createWeatherApi().fetchForecast(
    submission.location
  )

  if (weatherError) {
    // TODO: Logging

    // TODO: Better status then 500 to return here?
    throw new Response(weatherError.message, { status: 500 })
  }

  const openai = new OpenAI({
    apiKey: import.meta.env.OPENAI_API_KEY
  })

  // TODO: Use user's preferred units
  const temperatureUnit = "Celcius"
  const culture = defaultLocale.culture

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
          `I wear clothing typically made to fit ${
            submission.fit === "any" ? "men or women" : submission.fit
          }.`,
          `I like to dress in a ${submission.style} style.`,
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

  const image = await openai.images.generate({
    model: "dall-e-3",
    prompt: formatContent([
      "You have been given this description for what to wear today:",
      text ?? "",
      `The foreground shows an illustration of 1 ${submission.subject} dressed in ${submission.fit} ${submission.style} style clothes matching the description above.`,
      "DO NOT depict the description in the illustration.",
      "There is NOTHING in the background of the image.",
      `Include ONLY 1 ${submission.subject} in foreground of the image.`,
      "DO NOT include any other features, adornments or text foreground or background of the illustration."
    ]),
    n: 1,
    size: "1024x1024"
  })

  const image_url = image.data[0].url

  return json({ submission, text, image_url })
}

export const meta: MetaFunction = () => {
  // TODO: Use loader data here
  return [
    { title: "WeatherWear" },
    {
      name: "description",
      content: "Let me tell you what to wear today based on your local weather."
    }
  ]
}

export default function Index() {
  const { text, image_url } = useLoaderData<typeof loader>()

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Your forecast for today</h1>

      {/* TODO: Stream results:
      https://www.jacobparis.com/content/remix-defer-streaming-progress
      https://remix.run/docs/en/main/guides/streaming */}
      <p>
        {image_url && <img src={image_url} alt="" style={{ height: "80vh" }} />}
        <br />
        {text ?? ""}
      </p>
    </div>
  )
}
