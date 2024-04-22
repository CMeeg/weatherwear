import { Header } from "./Header"
import css from "./DefaultLayout.module.css"

function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className={css.main} role="main">
        {children}
      </main>
    </>
  )
}

export { DefaultLayout }
