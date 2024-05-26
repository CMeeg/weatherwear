import { z } from "zod"
import { forecast } from "~/db/schema"
import type { ForecastWeather } from "./weather"
import type { Nullable, ValueOf } from "~/lib/core"

const wearProfileAttributeItem = z.object({
  codename: z.string(),
  name: z.string()
})

type WearProfileAttributeItem = z.infer<typeof wearProfileAttributeItem>

const wearProfileSchema = z.object({
  subject: wearProfileAttributeItem,
  fit: wearProfileAttributeItem,
  style: wearProfileAttributeItem
})

type WearProfile = z.infer<typeof wearProfileSchema>

const wearProfileAttribute = wearProfileSchema.keyof()

type WearProfileAttribute = z.infer<typeof wearProfileAttribute>

const wearSuggestionSchema = z.object({
  advice: z.string(),
  description: z.string(),
  weather: z.string(),
  meta: z.object({
    id: z.string(),
    model: z.string(),
    usage: z.object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number()
    }),
    system_fingerprint: z.string().nullable()
  })
})

type WearSuggestion = z.infer<typeof wearSuggestionSchema>

type WearForecast = typeof forecast.$inferSelect

const forecastCompletionEventName = "completion" as const

const forecastCompletionEventStatus = {
  completed: "completed",
  fetchingWeather: "fetching_weather",
  fetchingSuggestion: "fetching_suggestion",
  generatingImage: "generating_image",
  failed: "failed"
} as const

type ForecastCompletionEventStatus = ValueOf<
  typeof forecastCompletionEventStatus
>

interface ForecastCompletionEvent {
  id: string
  urlSlug: string
  status: ForecastCompletionEventStatus
  weather: Nullable<ForecastWeather>
}

export {
  wearProfileSchema,
  wearProfileAttribute,
  wearProfileAttributeItem,
  wearSuggestionSchema,
  forecastCompletionEventName,
  forecastCompletionEventStatus
}

export type {
  WearProfile,
  WearProfileAttribute,
  WearProfileAttributeItem,
  WearSuggestion,
  WearForecast,
  ForecastCompletionEvent,
  ForecastCompletionEventStatus
}
