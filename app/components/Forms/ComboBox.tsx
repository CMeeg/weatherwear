import {
  Button,
  ComboBox as AriaComboBox,
  FieldError,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Text,
  ValidationResult
} from "react-aria-components"
import type {
  ComboBoxProps as AriaComboBoxProps,
  ComboBoxRenderProps,
  ListBoxItemProps
} from "react-aria-components"
import { clsx } from "clsx"
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
  className,
  label,
  description,
  placeholder,
  errorMessage,
  children,
  ...props
}: ComboBoxProps<T>) {
  const getFieldClassName = (
    renderProps: ComboBoxRenderProps & { defaultClassName: string | undefined }
  ) => {
    const renderClassName =
      typeof className === "function" ? className(renderProps) : className

    return clsx(renderClassName, css.field)
  }

  return (
    <AriaComboBox {...props} className={(values) => getFieldClassName(values)}>
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
      <FieldError className="visually-hidden">{errorMessage}</FieldError>
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
