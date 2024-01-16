import {
  pgTable,
  date,
  json,
  jsonb,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import type { WearLocation, WearProfile, WearSuggestion } from "~/lib/forecast"
import type { WeatherForecast } from "~/lib/weather"

export const forecast = pgTable("forecast", {
  id: uuid("id").primaryKey(),
  created_at: timestamp("created_at", {
    mode: "string",
    withTimezone: true
  }).notNull(),
  updated_at: timestamp("updated_at", { mode: "string", withTimezone: true }),
  location: jsonb("location").notNull().$type<WearLocation>(),
  date: date("date", { mode: "string" }).notNull(),
  url_slug: text("url_slug").unique().notNull(),
  profile: jsonb("profile").notNull().$type<WearProfile>(),
  weather: json("weather").notNull().$type<WeatherForecast>(),
  suggestion: jsonb("suggestion").$type<WearSuggestion>(),
  image_id: uuid("image_id")
})
