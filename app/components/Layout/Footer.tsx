import { Link } from "@remix-run/react"
import { clsx } from "clsx"
import { Cloud } from "~/components/Cloud/Cloud"
import css from "./Footer.module.css"

interface FooterProps {
  className?: string
}

function Footer({ className }: FooterProps) {
  return (
    <footer className={className}>
      <Cloud className={clsx(["wrapper", css.cloud])}>
        <p>
          Made by <a href="https://github.com/CMeeg">Chris Meagher</a>
        </p>
        <ul>
          <Link to="/about">About</Link>
        </ul>
      </Cloud>
    </footer>
  )
}

export { Footer }
