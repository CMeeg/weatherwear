import {
  useActionData,
  useNavigation,
  useSubmit,
  useLoaderData
} from "@remix-run/react"
import { redirect, json } from "@remix-run/node"
import type { ActionFunctionArgs, MetaFunction } from "@remix-run/node"
import { Form } from "react-aria-components"
import { getCdnUrl } from "~/lib/url"
import {
  wearForecastRequestValidator,
  getForecastRequestFormProps
} from "~/lib/forecast/request.server"
import { createWearForecastApi } from "~/lib/forecast/api.server"
import { createWeatherApi } from "~/lib/weather/api.server"
import { Fieldset, Legend } from "~/components/Forms/Fieldset"
import { ValidationSummary } from "~/components/Forms/ValidationSummary"
import { GooglePlacesAutocomplete } from "~/components/Forms/GooglePlacesAutocomplete"
import { Select, SelectItem } from "~/components/Forms/Select"
import { Button } from "~/components/Forms/Button"
import css from "./index.module.css"

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
    <>
      <div className={css.intro}>
        <p>Not sure what to wear today based on the weather?</p>
        <p>
          Tell me where you&rsquo;ll be and a little bit about your fashion
          preferences and I&rsquo;ll give you some advice on what to wear.
        </p>
      </div>

      {/* TODO: Use CSRF token and/or some type of captcha to protect form */}
      <Form
        method="post"
        validationErrors={actionData?.errors}
        onSubmit={onSubmit}
      >
        <Fieldset disabled={isSubmitting}>
          <Legend className="h2">Get your forecast</Legend>

          <ValidationSummary
            heading="There was a problem getting your forecast:"
            errors={actionData?.errors}
          />

          <div className={css.inlineFields}>
            <GooglePlacesAutocomplete
              className={css.inlineField}
              name="location"
              label="Today I'll be in "
              placeholder="Enter a location"
              description="."
              isDisabled={isSubmitting}
            />
          </div>

          <div className={css.inlineFields}>
            <Select
              className={css.inlineField}
              name="subject"
              label="I'm a "
              isDisabled={isSubmitting}
              errorMessage={undefined}
              isSecret={true}
              items={requestForm.subject.items}
              description="&nbsp;who likes to wear clothes&nbsp;"
              defaultSelectedKey={requestForm.subject.items[0]?.id}
            >
              {(item) => (
                <SelectItem id={item.id}>{item.name.toLowerCase()}</SelectItem>
              )}
            </Select>
            <Select
              className={css.inlineField}
              name="fit"
              label="made to fit "
              description=".&nbsp;"
              isDisabled={isSubmitting}
              items={requestForm.fit.items}
            >
              {(item) => (
                <SelectItem id={item.id}>{item.name.toLowerCase()}</SelectItem>
              )}
            </Select>
            <Select
              className={css.inlineField}
              name="style"
              label="I'd say my style is "
              description="."
              isDisabled={isSubmitting}
              items={requestForm.style.items}
            >
              {(item) => (
                <SelectItem id={item.id}>{item.name.toLowerCase()}</SelectItem>
              )}
            </Select>
          </div>

          <div className={css.formActions}>
            <Button type="submit" isDisabled={isSubmitting}>
              {isSubmitting ? "Fetching your forecast" : "Give me some advice!"}
            </Button>
          </div>
        </Fieldset>
      </Form>
    </>
  )
}
