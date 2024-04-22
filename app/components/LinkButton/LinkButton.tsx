import { Link } from "@remix-run/react"
import type { LinkProps } from "@remix-run/react"
import css from "~/components/Forms/Button.module.css"

type LinkButtonProps = Pick<LinkProps, "to" | "children">

function LinkButton({ to, children }: LinkButtonProps) {
  return (
    <Link to={to} className={css.button}>
      {children}
    </Link>
  )
}

export { LinkButton }

export type { LinkButtonProps }
