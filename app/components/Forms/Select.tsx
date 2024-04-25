import { useState } from "react"
import {
  Button,
  FieldError,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  SelectValue,
  Text,
  ValidationResult
} from "react-aria-components"
import type {
  ListBoxItemProps,
  SelectProps as AriaSelectProps,
  SelectRenderProps
} from "react-aria-components"
import { clsx } from "clsx"
import css from "./Select.module.css"

interface SelectProps<T extends object>
  extends Omit<AriaSelectProps<T>, "children"> {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  isSecret?: boolean
  items?: Iterable<T>
  children: React.ReactNode | ((item: T) => React.ReactNode)
}

function Select<T extends object>({
  className,
  label,
  description,
  errorMessage,
  isSecret,
  children,
  items,
  ...props
}: SelectProps<T>) {
  const [discovered, setDiscovered] = useState(false)

  const getFieldClassName = (renderProps: SelectRenderProps) => {
    const renderClassName =
      typeof className === "function" ? className(renderProps) : className

    return clsx(renderClassName, css.field, {
      [css.secret ?? ""]: isSecret && !discovered
    })
  }

  return (
    <AriaSelect
      {...props}
      className={(values) => getFieldClassName(values)}
      onFocus={() => setDiscovered(true)}
    >
      <Label className="">{label}</Label>
      <div className={css.container}>
        <Button className={css.button}>
          <SelectValue />
        </Button>
      </div>
      {description && <Text slot="description">{description}</Text>}
      <FieldError className="visually-hidden">{errorMessage}</FieldError>
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
