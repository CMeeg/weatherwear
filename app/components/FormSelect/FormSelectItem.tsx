import { ListBoxItem } from "react-aria-components"
import type { ListBoxItemProps } from "react-aria-components"

function FormSelectItem(props: ListBoxItemProps) {
  return (
    <ListBoxItem
      {...props}
      className={({ isFocused, isSelected }) =>
        `my-item ${isFocused ? "focused" : ""} ${isSelected ? "selected" : ""}`
      }
    />
  )
}

export { FormSelectItem }
