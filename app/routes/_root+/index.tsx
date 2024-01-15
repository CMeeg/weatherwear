import { redirect } from "@remix-run/node"
import { useActionData, useNavigation, useSubmit } from "@remix-run/react"
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node"
import { Form, Button } from "react-aria-components"
import {
  subjectItems,
  fitItems,
  styleItems,
  wearForecastRequestValidator
} from "~/lib/wear"
import { createWeatherApi } from "~/lib/weather/api.server"
import { createWearForecast } from "~/lib/wear/db.server"
import { FormSelect, FormSelectItem } from "~/components/FormSelect"
import { FormLocationInput } from "~/components/FormLocationInput"

export async function action({ request }: ActionFunctionArgs) {
  // Validate form data

  const formData = await request.formData()

  // TODO: Can use same validator on client too?
  const validationResult = await wearForecastRequestValidator.validate(formData)

  if (validationResult.error) {
    return {
      errors: validationResult.error.fieldErrors
    }
  }

  const forecastRequest = validationResult.data

  // Fetch and validate weather forecast for provided location

  const weatherApi = createWeatherApi()

  const [weatherForecast, weatherForecastError] =
    await weatherApi.fetchForecast(forecastRequest.location)

  if (weatherForecastError) {
    // TODO: Be a bit smarter about error messages depending on type of error returned
    return {
      errors: {
        location:
          "Sorry we couldn't fetch the weather for that location. Try searching for your nearest large town or city instead."
      }
    }
  }

  // Create the forecast and redirect over to the forecast page

  const forecast = await createWearForecast(forecastRequest, weatherForecast)

  return redirect(`/forecast/${forecast.url_slug}`)
}

export const meta: MetaFunction = () => {
  return [
    { title: "WeatherWear" },
    {
      name: "description",
      content: "Let me tell you what to wear today based on your local weather."
    }
  ]
}

export default function Index() {
  const actionData = useActionData<typeof action>()

  const submit = useSubmit()
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit(e.currentTarget)
  }

  const navigation = useNavigation()
  const isSubmitting = navigation.state !== "idle"

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Looking at the weather and wondering what to wear today?</h1>
      <p>Well wonder no longer - I&rsquo;m here to help!</p>
      <p>
        Tell me where you are and a little bit about yourself and I&rsquo;ll
        give you some pointers on what to wear today based on your local
        weather.
      </p>

      <Form
        method="post"
        validationErrors={actionData?.errors}
        onSubmit={onSubmit}
      >
        <fieldset disabled={isSubmitting}>
          <FormLocationInput name="location" label="I'm in " isRequired />
          <span>. </span>
          <FormSelect
            name="subject"
            label="I'm a "
            isRequired
            items={subjectItems}
          >
            {(item) => (
              <FormSelectItem id={item.codename}>{item.name}</FormSelectItem>
            )}
          </FormSelect>
          <span>who likes to wear clothes </span>
          <FormSelect
            name="fit"
            label="made to fit "
            isRequired
            items={fitItems}
          >
            {(item) => (
              <FormSelectItem id={item.codename}>{item.name}</FormSelectItem>
            )}
          </FormSelect>
          <span>and I&rsquo;d say </span>
          <FormSelect
            name="style"
            label="my style is "
            isRequired
            items={styleItems}
          >
            {(item) => (
              <FormSelectItem id={item.codename}>{item.name}</FormSelectItem>
            )}
          </FormSelect>
          <span>. </span>
          <Button type="submit">
            {isSubmitting
              ? "Fetching your forecast"
              : "Please tell me what I should wear today!"}
          </Button>
        </fieldset>
      </Form>
    </div>
  )
}
