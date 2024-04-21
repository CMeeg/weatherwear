import {
  Button,
  ComboBox as AriaComboBox,
  ComboBoxProps as AriaComboBoxProps,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxItemProps,
  Popover,
  Text,
  ValidationResult
} from "react-aria-components"
import classnames from "classnames"
import css from "./ComboBox.module.css"

interface ComboBoxProps<T extends object>
  extends Omit<AriaComboBoxProps<T>, "children"> {
  label?: string
  description?: string | null
  placeholder?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

function ComboBox<T extends object>({
  label,
  description,
  placeholder,
  errorMessage,
  children,
  ...props
}: ComboBoxProps<T>) {
  // TODO: Add a function to handle the className prop being a function
  const fieldClass = {
    [css.field ?? ""]: true
  }

  if (typeof props.className === "string") {
    fieldClass[props.className] = true
  }

  return (
    <AriaComboBox {...props} className={classnames(fieldClass)}>
      <Label className="">{label}</Label>
      <div className={css.container}>
        <Input
          className={css.input}
          placeholder={placeholder}
          // TODO: Have the width of the input resize to fit the content
          // onInput={(e) =>
          //   (e.currentTarget.size =
          //     e.currentTarget.value.length === 0
          //       ? e.currentTarget.placeholder.length ?? 0
          //       : e.currentTarget.value.length)
          // }
        />
        <Button className={css.button}>▼</Button>
      </div>
      {description && <Text slot="description">{description}</Text>}
      <FieldError>{errorMessage}</FieldError>
      <Popover className={css.popover}>
        <ListBox className={css.listBox}>{children}</ListBox>
      </Popover>
    </AriaComboBox>
  )
}

function ComboBoxItem(props: ListBoxItemProps) {
  return <ListBoxItem className={css.listItem} {...props} />
}

export { ComboBox, ComboBoxItem }

export type { ComboBoxProps }
