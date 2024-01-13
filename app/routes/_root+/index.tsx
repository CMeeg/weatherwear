import { json, redirect } from "@remix-run/node"
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit
} from "@remix-run/react"
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction
} from "@remix-run/node"
import { Form, Button } from "react-aria-components"
import {
  subjectItems,
  fitItems,
  styleItems,
  wearForecastRequestValidator
} from "~/lib/wear"
import { createWearForecast } from "~/lib/wear/db.server"
import { FormSelect, FormSelectItem } from "~/components/FormSelect"
import { FormGeolocationInput } from "~/components/FormGeolocationInput"

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData()

  const validationResult = await wearForecastRequestValidator.validate(formData)

  if (validationResult.error) {
    return {
      errors: validationResult.error.fieldErrors
    }
  }

  const forecastRequest = validationResult.data

  const forecast = await createWearForecast(forecastRequest)

  return redirect(`/forecast/${forecast.url_slug}`)
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  /* TODO:
  [x] Move this to an action and use a PRG pattern to redirect to the forecast page after a successful submission
  [x] Validate inputs against known good values
  [ ] Can use server validator on client?
  [x] If invalid re-render the page and show errors
  [ ] If valid make a request to get the local weather
  [ ] If multiple location matches are found, show a list of options to choose from? Or error?
  [x] Generate a URL slug and id and insert a new forecast into the database, or fetch existing forecast if exists
  [x] Redirect to the forecast page using the generated URL slug
  */

  // TODO: Validate these inputs using `wearForecastRequestValidator`
  const submissionData = new URL(request.url).searchParams

  const submission = {
    location: submissionData.get("location"),
    style: submissionData.get("style"),
    fit: submissionData.get("fit"),
    subject: submissionData.get("subject")
  }

  return json({ submission, subjectItems, fitItems, styleItems })
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
  const submit = useSubmit()
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    submit(e.currentTarget)
  }

  const actionData = useActionData<typeof action>()

  const { submission, subjectItems, fitItems, styleItems } =
    useLoaderData<typeof loader>()

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
          <FormGeolocationInput
            name="location"
            label="I'm in "
            isRequired
            defaultInputValue={submission?.location ?? ""}
          />
          <span>. </span>
          <FormSelect
            name="subject"
            label="I'm a "
            isRequired
            items={subjectItems}
            defaultSelectedKey={submission?.subject ?? ""}
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
            defaultSelectedKey={submission?.fit ?? ""}
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
            defaultSelectedKey={submission?.style ?? ""}
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
