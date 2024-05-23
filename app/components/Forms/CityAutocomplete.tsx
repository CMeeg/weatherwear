import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher"
import { ComboBox, ComboBoxItem } from "./ComboBox"
import type { ComboBoxProps } from "./ComboBox"
import type { LocationsApiResponse } from "~/lib/places"

type CityAutocompleteProps<T extends object> = Pick<
  ComboBoxProps<T>,
  | "className"
  | "name"
  | "label"
  | "placeholder"
  | "description"
  | "isRequired"
  | "isDisabled"
>

function CityAutocomplete<T extends object>({
  className,
  name,
  label,
  placeholder,
  description,
  isRequired,
  isDisabled
}: CityAutocompleteProps<T>) {
  const locationsFetcher = useDebounceFetcher<LocationsApiResponse>()

  return (
    <ComboBox
      className={className}
      name={name}
      label={label}
      placeholder={placeholder}
      description={description}
      formValue="key"
      isRequired={isRequired}
      isDisabled={isDisabled}
      errorMessage={(validation) =>
        validation.isInvalid
          ? locationsFetcher.data?.error ?? "Unknown error."
          : ""
      }
      onInputChange={(input): void => {
        if (
          !(locationsFetcher.data?.items ?? []).some((i) => i.name === input)
        ) {
          locationsFetcher.submit(
            { q: input },
            {
              action: "/api/location/suggest",
              method: "GET",
              debounceTimeout: 400
            }
          )
        }
      }}
      items={locationsFetcher.data?.items}
    >
      {(item) => (
        <ComboBoxItem id={item.id} key={item.id}>
          {item.name}
        </ComboBoxItem>
      )}
    </ComboBox>
  )
}

export { CityAutocomplete }

export type { CityAutocompleteProps }
