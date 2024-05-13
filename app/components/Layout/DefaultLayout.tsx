import { Header } from "./Header"
import { Footer } from "./Footer"
import css from "./DefaultLayout.module.css"

function DefaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={css.canvas}>
      <Header className={css.header} />
      <main role="main" className={css.main}>
        {children}
      </main>
      <Footer className={css.footer} />
    </div>
  )
}

export { DefaultLayout }
