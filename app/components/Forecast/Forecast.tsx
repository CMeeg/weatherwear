import { Image } from "@unpic/react"
import type { Nullable } from "~/lib/core"
import { LinkButton } from "~/components/LinkButton/LinkButton"
import css from "./Forecast.module.css"

interface ForecastProps {
  text: string
  imageUrl: Nullable<string>
}

function Forecast({ text, imageUrl }: ForecastProps) {
  return (
    <div className={css.forecast}>
      <div className={css.text}>
        <p>{text}</p>
        <p>
          <LinkButton to="/">Request another forecast</LinkButton>
        </p>
      </div>
      {imageUrl && (
        <div className={css.image}>
          <Image
            src={imageUrl}
            width={1024}
            height={1024}
            alt=""
            // priority={true}
          />
        </div>
      )}
    </div>
  )
}

export { Forecast }

export type { ForecastProps }
