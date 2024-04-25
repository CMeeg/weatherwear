import { clsx } from "clsx"
import css from "./Fieldset.module.css"

interface FieldsetProps
  extends React.FieldsetHTMLAttributes<HTMLFieldSetElement> {}

function Fieldset({ className, children, ...props }: FieldsetProps) {
  return (
    <fieldset {...props} className={clsx(css.fieldset, className)}>
      {children}
    </fieldset>
  )
}

interface LegendProps extends React.HTMLAttributes<HTMLLegendElement> {}

function Legend({ className, children, ...props }: LegendProps) {
  return (
    <legend {...props} className={clsx(css.legend, className)}>
      {children}
    </legend>
  )
}

export { Fieldset, Legend }

export type { FieldsetProps }
