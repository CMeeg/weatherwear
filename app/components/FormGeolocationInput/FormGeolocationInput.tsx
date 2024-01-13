import {
  ComboBox,
  Label,
  Group,
  Input,
  Button,
  Popover,
  ListBox,
  ListBoxItem,
  FieldError,
  Text
} from "react-aria-components"
import type { ComboBoxProps, ValidationResult } from "react-aria-components"
import { useFetcher } from "@remix-run/react"
import { useState } from "react"

interface FormGeolocationInputProps<T extends object>
  extends Omit<ComboBoxProps<T>, "children" | "items" | "formValue"> {
  label?: string
  description?: string | null
  errorMessage?: string | ((validation: ValidationResult) => string)
}

function FormGeolocationInput<T extends object>({
  label,
  description,
  errorMessage,
  ...props
}: FormGeolocationInputProps<T>) {
  interface GeolocationItem {
    name: string
  }

  interface LocationsSuggestion {
    items: GeolocationItem[]
    error?: string
  }

  const locationsFetcher = useFetcher<LocationsSuggestion>()

  const { items, error } = locationsFetcher.data ?? { items: [] }

  const [value, setValue] = useState("")

  return (
    <ComboBox
      {...props}
      formValue="text"
      onInputChange={(input) => {
        if (input !== value) {
          locationsFetcher.load(`/api/location/suggest?q=${input}`)
        }
      }}
      onSelectionChange={(selected) =>
        setValue(selected ? selected.toString() : "")
      }
      isInvalid={typeof error === "string" && error.length > 0}
    >
      <Label>{label}</Label>
      <Group className="my-combobox-container">
        <Input />
        <Button>▼</Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage ?? error}</FieldError>
      <Popover>
        <ListBox items={items}>
          {(item) => (
            <ListBoxItem
              id={item.name}
              className={({ isFocused, isSelected }) =>
                `my-item ${isFocused ? "focused" : ""} ${
                  isSelected ? "selected" : ""
                }`
              }
            >
              {item.name}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </ComboBox>
  )
}

export { FormGeolocationInput }

export type { FormGeolocationInputProps }
