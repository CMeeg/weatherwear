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
import classnames from "classnames"
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
  // TODO: Add a function to handle the className prop being a function
  const fieldClass = {
    [css.field ?? ""]: true
  }

  if (typeof props.className === "string") {
    fieldClass[props.className] = true
  }

  return (
    <AriaSelect {...props} className={classnames(fieldClass)}>
      <Label className="">{label}</Label>
      <div className={css.container}>
        <Button className={css.button}>
          <SelectValue />
        </Button>
      </div>
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
