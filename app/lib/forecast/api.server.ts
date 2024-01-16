import { eq } from "drizzle-orm"
import { format } from "date-fns"
import { v4 as uuid } from "uuid"
import slugify from "@sindresorhus/slugify"
import { result } from "~/lib/core"
import type { Nullable, FuncResult } from "~/lib/core"
import { wearLocationSchema, wearProfileSchema } from "~/lib/forecast"
import type {
  WearForecast,
  WearProfileAttribute,
  WearProfileAttributeItem
} from "~/lib/forecast"
import type { WearForecastRequest } from "~/lib/forecast/request.server"
import type { WeatherForecast } from "~/lib/weather"
import { db, dbSchema } from "~/db/client.server"
import { createSupabaseClient } from "~/supabase/client.server"
import { getForecastRequestFormProps } from "~/lib/forecast/request.server"

const fetchForecastFromSlug = async (
  urlSlug: string
): Promise<FuncResult<Nullable<WearForecast>>> => {
  try {
    const existing = await db
      .select()
      .from(dbSchema.public.forecast)
      .where(eq(dbSchema.public.forecast.url_slug, urlSlug))

    if (existing.length > 0) {
      // url_slug has a unique constraint so there will be at most one
      return result.ok(existing[0])
    }

    return result.ok(null)
  } catch (error) {
    // TODO: TypeScript erorrs!
    const message = error instanceof Error ? error.message : "Unknown error"

    return result.error(new Error(message, { cause: error }))
  }
}

const parseProfileAttribute = (
  forecastRequest: WearForecastRequest,
  attribute: WearProfileAttribute
): WearProfileAttributeItem | undefined => {
  const requestedAttributeId = forecastRequest[attribute]

  if (!requestedAttributeId) {
    return undefined
  }

  const attributeItem = getForecastRequestFormProps()[attribute].items.find(
    (item) => item.id === requestedAttributeId
  )

  if (!attributeItem) {
    return undefined
  }

  return {
    codename: attributeItem.id,
    name: attributeItem.name
  }
}

const updateForecast = async (
  forecast: WearForecast
): Promise<FuncResult<WearForecast>> => {
  const { id, ...update } = forecast

  update.updated_at = new Date().toISOString()

  try {
    const updated = await db
      .update(dbSchema.public.forecast)
      .set(update)
      .where(eq(dbSchema.public.forecast.id, id))
      .returning()

    return result.ok(updated[0])
  } catch (error) {
    // TODO: TypeScript erorrs!
    const message = error instanceof Error ? error.message : "Unknown error"

    return result.error(new Error(message, { cause: error }))
  }
}

const createWearForecastApi = () => {
  return {
    fetchForecastFromSlug,
    createForecast: async (
      forecastRequest: WearForecastRequest,
      weather: WeatherForecast
    ): Promise<FuncResult<WearForecast>> => {
      // Validate the request

      const location = await wearLocationSchema.safeParseAsync({
        text: forecastRequest.location
      })

      if (!location.success) {
        return result.error(location.error)
      }

      const profile = await wearProfileSchema.safeParseAsync({
        subject: parseProfileAttribute(forecastRequest, "subject"),
        fit: parseProfileAttribute(forecastRequest, "fit"),
        style: parseProfileAttribute(forecastRequest, "style")
      })

      if (!profile.success) {
        return result.error(profile.error)
      }

      // Generate a URL slug based on the request

      const date = format(new Date(), "yyyy-MM-dd")

      const urlSlug = slugify(
        `${profile.data.subject.name} in ${location.data.text} wearing ${profile.data.style.name} clothes for ${profile.data.fit.name} on ${date}`
      )

      // Check if a forecast with the URL slug already exists and return that if so

      const [existingForecast, existingForecastError] =
        await fetchForecastFromSlug(urlSlug)

      if (existingForecastError) {
        return result.error(existingForecastError)
      }

      if (existingForecast) {
        return result.ok(existingForecast)
      }

      try {
        const forecast = await db
          .insert(dbSchema.public.forecast)
          .values({
            id: uuid(),
            created_at: new Date().toISOString(),
            location: location.data,
            date,
            url_slug: urlSlug,
            profile: profile.data,
            weather
          })
          .returning()

        return result.ok(forecast[0])
      } catch (error) {
        // TODO: TypeScript erorrs!
        const message = error instanceof Error ? error.message : "Unknown error"

        return result.error(new Error(message, { cause: error }))
      }
    },
    updateForecast,
    addImageToForecast: async (
      forecast: WearForecast,
      imageData: string
    ): Promise<FuncResult<WearForecast>> => {
      // Convert the base64 string to a blob
      const base64Response = await fetch(`data:image/png;base64,${imageData}`)
      const blob = await base64Response.blob()

      // Upload the blob to storage
      // TODO: You need a Pro plan for image transformations so maybe i am better off with Azure blob storage plus ImageKit?
      const { data, error } = await createSupabaseClient()
        .storage.from("forecast")
        .upload(forecast.id, blob, { upsert: true })

      if (error) {
        return result.error(error)
      }

      // TODO: Actual return data doesn't match the type
      const image = data as { path: string; id: string; fullPath: string }

      forecast.image_id = image.id

      return await updateForecast(forecast)
    },
    getForecastImageUrl: (forecast: WearForecast) => {
      const { data } = createSupabaseClient()
        .storage.from("forecast")
        .getPublicUrl(forecast.id)

      return data.publicUrl
    }
  }
}

type ForecastApi = ReturnType<typeof createWearForecastApi>

export { createWearForecastApi }

export type { ForecastApi }
