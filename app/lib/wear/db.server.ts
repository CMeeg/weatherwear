import { eq } from "drizzle-orm"
import { format } from "date-fns"
import { v4 as uuid } from "uuid"
import slugify from "@sindresorhus/slugify"
import type { Nullable } from "~/lib/core"
import {
  parseWearProfileItem,
  subjectItems,
  fitItems,
  styleItems
} from "~/lib/wear"
import type { WearForecastRequest, WearForecast } from "~/lib/wear"
import { db, dbSchema } from "~/lib/db/client.server"

const forecastTable = dbSchema.public.forecast

const fetchWearForecastFromSlug = async (
  urlSlug: string
): Promise<Nullable<WearForecast>> => {
  const existing = await db
    .select()
    .from(forecastTable)
    .where(eq(forecastTable.url_slug, urlSlug))

  if (existing.length > 0) {
    // url_slug has a unique constraint so there will be at most one
    return existing[0]
  }

  return null
}

const createWearForecast = async (
  forecastRequest: WearForecastRequest
): Promise<WearForecast> => {
  const { location, ...profile } = forecastRequest

  // Generate a URL slug based on the request

  // TODO: Don't like that you have to pass in the items here - you could check a profile value against completely unrelated items
  const subject =
    parseWearProfileItem(profile.subject, subjectItems)?.name ?? ""
  const fit = parseWearProfileItem(profile.fit, fitItems)?.name ?? ""
  const style = parseWearProfileItem(profile.style, styleItems)?.name ?? ""
  const date = format(new Date(), "yyyy-MM-dd")

  const urlSlug = slugify(
    `${subject} in ${location} wearing ${style} clothes for ${fit} on ${date}`
  )

  // Check if a forecast with the URL slug already exists and return that if so

  const existing = await fetchWearForecastFromSlug(urlSlug)

  if (existing) {
    // url_slug has a unique constraint so there will be at most one
    return existing
  }

  const result = await db
    .insert(forecastTable)
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

const updateWearForecast = async (forecast: WearForecast) => {
  const { id, ...update } = forecast

  update.updated_at = new Date().toISOString()

  const result = await db
    .update(forecastTable)
    .set(update)
    .where(eq(forecastTable.id, id))
    .returning()

  return result[0]
}

export { fetchWearForecastFromSlug, createWearForecast, updateWearForecast }
