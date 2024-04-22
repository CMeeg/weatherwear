import { Button as RACButton, ButtonProps } from "react-aria-components"
import css from "./Button.module.css"

function Button(props: ButtonProps) {
  return <RACButton className={css.button} {...props} />
}

export { Button }