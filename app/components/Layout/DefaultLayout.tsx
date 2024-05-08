import { Header } from "./Header"
import css from "./DefaultLayout.module.css"

function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css.canvas}>
      <Header />
      <main role="main">{children}</main>
    </div>
  )
}

export { DefaultLayout }
