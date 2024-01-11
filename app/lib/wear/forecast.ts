import { format } from "date-fns"
import { v4 as uuid } from "uuid"
import slugify from "@sindresorhus/slugify"
import {
  parseWearProfileItem,
  subjectItems,
  fitItems,
  styleItems
} from "~/lib/wear"
import type { ForecastRequest } from "~/lib/wear"
import { forecast } from "~/lib/db"
import type { DbClient } from "~/lib/db"

const createForecast = async (
  db: DbClient,
  forecastRequest: ForecastRequest
) => {
  const { location, ...profile } = forecastRequest
  const subject =
    parseWearProfileItem(profile.subject, subjectItems)?.name ?? ""
  const fit = parseWearProfileItem(profile.fit, fitItems)?.name ?? ""
  const style = parseWearProfileItem(profile.style, styleItems)?.name ?? ""
  const date = format(new Date(), "yyyy-MM-dd")

  const urlSlug = slugify(
    `${subject} in ${location} wearing ${style} clothes for fit ${fit} on `
  )

  // TODO: Check if forecast already exists for the same slug and return that if so

  const result = await db
    .insert(forecast)
    .values({
      id: uuid(),
      created_at: new Date().toISOString(),
      location: { text: location },
      date,
      url_slug: urlSlug,
      profile: profile,
      weather: { todo: "weather" }
    })
    .returning()

  return result[0]
}

export { createForecast }
