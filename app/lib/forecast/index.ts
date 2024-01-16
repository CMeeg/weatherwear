import { z } from "zod"
import { forecast } from "~/db/schema"

const wearLocationSchema = z.object({
  text: z.string()
})

type WearLocation = z.infer<typeof wearLocationSchema>

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
    system_fingerprint: z.string()
  })
})

type WearSuggestion = z.infer<typeof wearSuggestionSchema>

type WearForecast = typeof forecast.$inferSelect

export {
  wearLocationSchema,
  wearProfileSchema,
  wearProfileAttribute,
  wearProfileAttributeItem,
  wearSuggestionSchema
}

export type {
  WearLocation,
  WearProfile,
  WearProfileAttribute,
  WearProfileAttributeItem,
  WearSuggestion,
  WearForecast
}
