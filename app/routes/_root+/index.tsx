import {
  useActionData,
  useNavigation,
  useSubmit,
  useLoaderData
} from "@remix-run/react"
import { redirect, json } from "@remix-run/node"
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node"
import { Form, Button } from "react-aria-components"
import { getCdnUrl } from "~/lib/url"
import {
  wearForecastRequestValidator,
  getForecastRequestFormProps
} from "~/lib/forecast/request.server"
import { createWearForecastApi } from "~/lib/forecast/api.server"
import { createWeatherApi } from "~/lib/weather/api.server"
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
    // TODO: There seems to be a bug where if this error is triggered you can't resubmit the form - like the error persists
    // TODO: Be a bit smarter about error messages depending on type of error returned
    return {
      errors: {
        location:
          "Sorry we couldn't fetch the weather for that location. Try searching for your nearest large town or city instead."
      }
    }
  }

  // Create the forecast and redirect over to the forecast page

  const forecastApi = createWearForecastApi()

  const [forecast, forecastError] = await forecastApi.createForecast(
    forecastRequest,
    weatherForecast
  )

  if (forecastError) {
    // TODO: Be a bit smarter about error messages depending on type of error returned
    // TODO: This is a "general" error so shouldn't be displayed against a field
    return {
      errors: {
        location: "Sorry we couldn't fetch your forecast. Please try again."
      }
    }
  }

  return redirect(`/forecast/${forecast.urlSlug}`)
}

export const loader = async () => {
  const requestForm = getForecastRequestFormProps()

  return json({
    requestForm,
    meta: [
      { title: "WeatherWear" },
      {
        name: "description",
        content:
          "Let me tell you what to wear today based on your local weather."
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
  if (!data) {
    return []
  }

  return data.meta
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

  const { requestForm } = useLoaderData<typeof loader>()

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Looking at the weather and wondering what to wear today?</h1>
      <p>Well wonder no longer - I&rsquo;m here to help!</p>
      <p>
        Tell me where you are and a little bit about yourself and I&rsquo;ll
        give you some pointers on what to wear today based on your local
        weather.
      </p>

      {/* TODO: Use CSRF token to protect form */}
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
            items={requestForm.subject.items}
          >
            {(item) => (
              <FormSelectItem id={item.id}>{item.name}</FormSelectItem>
            )}
          </FormSelect>
          <span>who likes to wear clothes </span>
          <FormSelect
            name="fit"
            label="made to fit "
            isRequired
            items={requestForm.fit.items}
          >
            {(item) => (
              <FormSelectItem id={item.id}>{item.name}</FormSelectItem>
            )}
          </FormSelect>
          <span>and I&rsquo;d say </span>
          <FormSelect
            name="style"
            label="my style is "
            isRequired
            items={requestForm.style.items}
          >
            {(item) => (
              <FormSelectItem id={item.id}>{item.name}</FormSelectItem>
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
