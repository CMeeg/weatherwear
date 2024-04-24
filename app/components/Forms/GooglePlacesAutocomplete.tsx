import { useDebounceFetcher } from "remix-utils/use-debounce-fetcher"
import { ComboBox, ComboBoxItem } from "./ComboBox"
import type { ComboBoxProps } from "./ComboBox"
import type { LocationsApiResponse } from "~/lib/places"

type GooglePlacesAutocompleteProps<T extends object> = Pick<
  ComboBoxProps<T>,
  | "className"
  | "name"
  | "label"
  | "placeholder"
  | "description"
  | "isRequired"
  | "isDisabled"
>

function GooglePlacesAutocomplete<T extends object>({
  className,
  name,
  label,
  placeholder,
  description,
  isRequired,
  isDisabled
}: GooglePlacesAutocompleteProps<T>) {
  const locationsFetcher = useDebounceFetcher<LocationsApiResponse>()

  return (
    <ComboBox
      className={className}
      name={name}
      label={label}
      placeholder={placeholder}
      description={description}
      formValue="text"
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
      isInvalid={(locationsFetcher.data?.error ?? "").length > 0}
      items={locationsFetcher.data?.items}
    >
      {(item) => <ComboBoxItem id={item.id}>{item.name}</ComboBoxItem>}
    </ComboBox>
  )
}

export { GooglePlacesAutocomplete }

export type { GooglePlacesAutocompleteProps }
