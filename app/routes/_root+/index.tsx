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
import { Cloud } from "~/components/Cloud/Cloud"
import { Fieldset, Legend } from "~/components/Forms/Fieldset"
import { ValidationSummary } from "~/components/Forms/ValidationSummary"
import { CityAutocomplete } from "~/components/Forms/CityAutocomplete"
import { Select, SelectItem } from "~/components/Forms/Select"
import { Button } from "~/components/Forms/Button"
import { clsx } from "clsx"
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

  // Create the forecast and redirect over to the forecast page

  const forecastApi = createWearForecastApi()

  const [forecast, forecastError] =
    await forecastApi.createForecast(forecastRequest)

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
  if (!data?.meta) {
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
      <div className={clsx(["wrapper", "no-gap", css.intro])}>
        <p>
          Not sure <span className="highlight">what to wear</span> today based
          on the weather?
        </p>
        <p>
          Tell me <span className="highlight">where you&rsquo;ll be</span> and a
          little bit about your{" "}
          <span className="highlight">fashion preferences</span> and I&rsquo;ll
          give you some <span className="highlight">advice</span> on what to
          wear.
        </p>
      </div>

      <Cloud className="wrapper">
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
              <CityAutocomplete
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
                  <SelectItem id={item.id}>
                    {item.name.toLowerCase()}
                  </SelectItem>
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
                  <SelectItem id={item.id}>
                    {item.name.toLowerCase()}
                  </SelectItem>
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
                  <SelectItem id={item.id}>
                    {item.name.toLowerCase()}
                  </SelectItem>
                )}
              </Select>
            </div>

            <div className={css.formActions}>
              <Button type="submit" isDisabled={isSubmitting}>
                {isSubmitting
                  ? "Fetching your forecast"
                  : "Give me some advice!"}
              </Button>
            </div>
          </Fieldset>
        </Form>
      </Cloud>
    </>
  )
}
