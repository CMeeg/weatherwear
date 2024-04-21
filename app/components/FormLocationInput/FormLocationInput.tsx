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
import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher"
import type { LocationsApiResponse } from "~/lib/places"
import css from "./FormLocationInput.module.css"

interface FormLocationInputProps<T extends object>
  extends Omit<
    ComboBoxProps<T>,
    "children" | "items" | "formValue" | "onInputChange" | "isInvalid"
  > {
  label?: string
  description?: string | null
  errorMessage?: string | ((validation: ValidationResult) => string)
}

function FormLocationInput<T extends object>({
  label,
  description,
  errorMessage,
  ...props
}: FormLocationInputProps<T>) {
  const locationsFetcher = useDebounceFetcher<LocationsApiResponse>()

  return (
    <ComboBox
      {...props}
      formValue="text"
      onInputChange={(input): void => {
        if (
          !(locationsFetcher.data?.items ?? []).some((i) => i.name === input)
        ) {
          locationsFetcher.submit(
            { q: input },
            {
              action: "/api/location/suggest",
              method: "GET",
              debounceTimeout: 600
            }
          )
        }
      }}
      isInvalid={(locationsFetcher.data?.error ?? "").length > 0}
    >
      <Label>{label}</Label>
      <Group className="my-combobox-container">
        <Input />
        <Button>▼</Button>
      </Group>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage ?? locationsFetcher.data?.error}</FieldError>
      <Popover className={css.items}>
        {/* TODO: Need to add [Google logo](https://developers.google.com/maps/documentation/places/web-service/policies#logo) when showing response */}
        <ListBox items={locationsFetcher.data?.items}>
          {(item) => (
            <ListBoxItem
              id={item.id}
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

export { FormLocationInput }

export type { FormLocationInputProps }
