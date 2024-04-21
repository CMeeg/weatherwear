import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  Popover,
  Select as AriaSelect,
  SelectProps as AriaSelectProps,
  SelectValue,
  Text,
  ValidationResult
} from "react-aria-components"
import css from "./Select.module.css"

interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children"> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  items?: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

function Select<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect className="" {...props}>
      <Label className="">{label}</Label>
      <Button className={css.button}>
        <SelectValue />
      </Button>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className={css.popover}>
        <ListBox className={css.listBox} items={items}>
          {children}
        </ListBox>
      </Popover>
    </AriaSelect>
  )
}

function SelectItem(props: ListBoxItemProps) {
  return <ListBoxItem className={css.listItem} {...props} />
}

export { Select, SelectItem }

export type { SelectProps }
