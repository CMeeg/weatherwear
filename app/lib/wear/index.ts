import { z } from "zod"
import { withZod } from "@remix-validated-form/with-zod"
import { forecast } from "../../../db/schema"

interface WearLocation {
  text: string
}

interface WearProfileItem {
  codename: string
  name: string
}

const subjectItems: Array<WearProfileItem> = [
  { codename: "human", name: "Human" },
  { codename: "elf", name: "Elf" },
  { codename: "cat", name: "Cat" },
  { codename: "dog", name: "Dog" },
  { codename: "badger", name: "Badger" },
  { codename: "horse", name: "Horse" }
]

const fitItems: Array<WearProfileItem> = [
  { codename: "men", name: "Men" },
  { codename: "women", name: "Women" },
  { codename: "men_or_women", name: "Men or Women" }
]

const styleItems: Array<WearProfileItem> = [
  { codename: "casual", name: "Casual" },
  { codename: "formal", name: "Formal" },
  { codename: "bohemian", name: "Bohemian" },
  { codename: "vintage", name: "Vintage" },
  { codename: "preppy", name: "Preppy" },
  { codename: "punk", name: "Punk" },
  { codename: "goth", name: "Goth" },
  { codename: "grunge", name: "Grunge" }
]

const parseWearProfileItem = (
  codename: string,
  items: Array<WearProfileItem>
) => {
  if (!codename) {
    return null
  }

  const profileItem = items.find((item) => item.codename === codename)

  if (!profileItem) {
    return null
  }

  return profileItem
}

const wearProfileSchema = z.object({
  subject: z
    .string()
    .min(1, { message: "What are you?" })
    .refine((val) => parseWearProfileItem(val, subjectItems) !== null, {
      message: "Please select an item in the list."
    }),
  fit: z
    .string()
    .min(1, { message: "What fit do you like?" })
    .refine((val) => parseWearProfileItem(val, fitItems) !== null, {
      message: "Please select an item in the list."
    }),
  style: z
    .string()
    .min(1, { message: "What's your style?" })
    .refine((val) => parseWearProfileItem(val, styleItems) !== null, {
      message: "Please select an item in the list."
    })
})

type WearProfile = z.infer<typeof wearProfileSchema>

const wearForecastRequestSchema = z
  .object({
    location: z.string().min(1, { message: "Where are you?" })
  })
  .merge(wearProfileSchema)

type WearForecastRequest = z.infer<typeof wearForecastRequestSchema>

const wearForecastRequestValidator = withZod(wearForecastRequestSchema)

interface WearSuggestion {
  advice: string
  description: string
  weather: string
}

type WearForecast = typeof forecast.$inferSelect

export {
  subjectItems,
  fitItems,
  styleItems,
  parseWearProfileItem,
  wearForecastRequestSchema,
  wearForecastRequestValidator
}

export type {
  WearLocation,
  WearProfile,
  WearProfileItem,
  WearForecastRequest,
  WearSuggestion,
  WearForecast
}
