import { clsx } from "clsx"
import css from "./Cloud.module.css"

interface CloudProps {
  className?: string
  children: React.ReactNode
}

function Cloud({ className, children }: CloudProps) {
  return <div className={clsx([className, css.cloud])}>{children}</div>
}

export type { CloudProps }

export { Cloud }
