import {
  Button,
  FieldError,
  Label,
  ListBox,
  Popover,
  Select,
  SelectValue,
  Text
} from "react-aria-components"
import type { SelectProps, ValidationResult } from "react-aria-components"

interface FormSelectProps<T extends object>
  extends Omit<SelectProps<T>, "children"> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  items?: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

function FormSelect<T extends object>({
  label,
  description,
  errorMessage,
  children,
  items,
  ...props
}: FormSelectProps<T>) {
  return (
    <Select {...props}>
      <Label>{label}</Label>
      <Button>
        <SelectValue />
        <span aria-hidden="true">▼</span>
      </Button>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover>
        <ListBox items={items}>{children}</ListBox>
      </Popover>
    </Select>
  )
}

export { FormSelect }

export type { FormSelectProps }
