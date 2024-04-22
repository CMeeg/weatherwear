import classnames from "classnames"
import css from "./Fieldset.module.css"

interface FieldsetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {
  legend?: string
}

function Fieldset({ legend, className, children, ...props }: FieldsetProps) {
  return (
    <fieldset {...props} className={classnames(css.fieldset, className)}>
      {legend && (
        <legend className={classnames(css.legend, "h2")}>{legend}</legend>
      )}
      {children}
    </fieldset>
  )
}

export { Fieldset }

export type { FieldsetProps }
