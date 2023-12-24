import { json } from "@remix-run/node"
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { useLoaderData, useNavigation, Form } from "@remix-run/react"
import {
  Button,
  FieldError,
  Input,
  Label,
  TextField,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue
} from "react-aria-components"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const submissionData = new URL(request.url).searchParams

  const submission = {
    location: submissionData.get("location"),
    style: submissionData.get("style"),
    fit: submissionData.get("fit"),
    subject: submissionData.get("subject")
  }

  return json({ submission })
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
  const { submission } = useLoaderData<typeof loader>()

  const navigation = useNavigation()
  const isSubmitting = navigation.formAction === "/forecast"

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Looking at the weather and wondering what to wear today?</h1>
      <p>Well wonder no longer - I&rsquo;m here to help!</p>
      <p>
        Tell me where you are and a little bit about yourself and I&rsquo;ll
        give you some pointers on what to wear today based on your local
        weather.
      </p>

      <Form action="/forecast">
        <fieldset disabled={isSubmitting}>
          <TextField
            name="location"
            type="text"
            isRequired
            defaultValue={submission?.location ?? ""}
          >
            <Label>I&rsquo;m in </Label>
            <Input />
            <FieldError />
          </TextField>
          <span>. </span>
          <Select
            name="style"
            isRequired
            defaultSelectedKey={submission?.style ?? ""}
          >
            <Label>I like to wear </Label>
            <Button>
              <SelectValue />
              <span aria-hidden="true">▼</span>
            </Button>
            <Popover>
              <ListBox>
                <ListBoxItem key="casual" id="casual">
                  Casual
                </ListBoxItem>
                <ListBoxItem key="formal" id="formal">
                  Formal
                </ListBoxItem>
                <ListBoxItem key="party" id="party">
                  Party
                </ListBoxItem>
                <ListBoxItem key="christmassy" id="christmassy">
                  Christmassy
                </ListBoxItem>
              </ListBox>
            </Popover>
          </Select>
          <span>clothes </span>
          <Select
            name="fit"
            isRequired
            defaultSelectedKey={submission?.fit ?? ""}
          >
            <Label>made for </Label>
            <Button>
              <SelectValue />
              <span aria-hidden="true">▼</span>
            </Button>
            <Popover>
              <ListBox>
                <ListBoxItem key="men" id="men">
                  Men
                </ListBoxItem>
                <ListBoxItem key="women" id="women">
                  Women
                </ListBoxItem>
                <ListBoxItem key="men or women" id="men or women">
                  Men or Women
                </ListBoxItem>
              </ListBox>
            </Popover>
          </Select>
          <span>. Oh, and </span>
          <Select
            name="subject"
            isRequired
            defaultSelectedKey={submission?.subject ?? ""}
          >
            <Label>I&rsquo;m a </Label>
            <Button>
              <SelectValue />
              <span aria-hidden="true">▼</span>
            </Button>
            <Popover>
              <ListBox>
                <ListBoxItem key="human" id="human">
                  Human
                </ListBoxItem>
                <ListBoxItem key="cat" id="cat">
                  Cat
                </ListBoxItem>
                <ListBoxItem key="elf" id="elf">
                  Elf
                </ListBoxItem>
                <ListBoxItem key="reindeer" id="reindeer">
                  Reindeer
                </ListBoxItem>
              </ListBox>
            </Popover>
          </Select>
          <span>. </span>
          <Button type="submit">
            {isSubmitting
              ? "Fetching your forecast"
              : "Please tell me what I should wear!"}
          </Button>
        </fieldset>
      </Form>
    </div>
  )
}
