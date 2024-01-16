import { z } from "zod"
import { withZod } from "@remix-validated-form/with-zod"
import type { FormListItem } from "~/lib/forms"

const subjectItems: FormListItem[] = [
  { id: "human", name: "Human" },
  { id: "elf", name: "Elf" },
  { id: "cat", name: "Cat" },
  { id: "dog", name: "Dog" },
  { id: "badger", name: "Badger" },
  { id: "bear", name: "Bear" },
  { id: "lion", name: "Lion" },
  { id: "rabbit", name: "Rabbit" },
  { id: "wolf", name: "Wolf" },
  { id: "panda", name: "Panda" }
]

const fitItems: FormListItem[] = [
  { id: "men", name: "Men" },
  { id: "women", name: "Women" },
  { id: "men_or_women", name: "Men or Women" }
]

const styleItems: FormListItem[] = [
  { id: "casual", name: "Casual" },
  { id: "formal", name: "Formal" },
  { id: "bohemian", name: "Bohemian" },
  { id: "vintage", name: "Vintage" },
  { id: "preppy", name: "Preppy" },
  { id: "punk", name: "Punk" },
  { id: "goth", name: "Goth" },
  { id: "grunge", name: "Grunge" }
]

const getForecastRequestFormProps = () => {
  return {
    subject: {
      items: subjectItems
    },
    fit: {
      items: fitItems
    },
    style: {
      items: styleItems
    }
  }
}

const wearForecastRequestSchema = z.object({
  location: z.string().min(1, { message: "Where are you?" }),
  subject: z
    .string()
    .min(1, { message: "What are you?" })
    .refine(
      (val) =>
        getForecastRequestFormProps().subject.items.some(
          (item) => item.id == val
        ),
      {
        message: "Please select an item in the list."
      }
    ),
  fit: z
    .string()
    .min(1, { message: "What fit do you like?" })
    .refine(
      (val) =>
        getForecastRequestFormProps().fit.items.some((item) => item.id == val),
      {
        message: "Please select an item in the list."
      }
    ),
  style: z
    .string()
    .min(1, { message: "What's your style?" })
    .refine(
      (val) =>
        getForecastRequestFormProps().style.items.some(
          (item) => item.id == val
        ),
      {
        message: "Please select an item in the list."
      }
    )
})

type WearForecastRequest = z.infer<typeof wearForecastRequestSchema>

const wearForecastRequestValidator = withZod(wearForecastRequestSchema)

export {
  getForecastRequestFormProps,
  wearForecastRequestSchema,
  wearForecastRequestValidator
}

export type { WearForecastRequest }
