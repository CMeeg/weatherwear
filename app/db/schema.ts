import {
  pgTable,
  date,
  json,
  jsonb,
  text,
  timestamp,
  uuid,
  integer,
  decimal
} from "drizzle-orm/pg-core"
import type { WearProfile, WearSuggestion } from "~/lib/forecast"
import type { WeatherForecast } from "~/lib/weather"

export const forecast = pgTable("forecast", {
  id: uuid("id").primaryKey(),
  createdAt: timestamp("created_at", {
    mode: "string",
    withTimezone: false
  })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "string", withTimezone: false }),
  date: date("date", { mode: "string" }).notNull(),
  cityId: uuid("city_id").notNull(),
  urlSlug: text("url_slug").unique().notNull(),
  profile: jsonb("profile").notNull().$type<WearProfile>(),
  weather: json("weather").$type<WeatherForecast>(),
  suggestion: jsonb("suggestion").$type<WearSuggestion>(),
  imagePath: text("image_path")
})

export const city = pgTable("city", {
  id: uuid("id").primaryKey(),
  cityId: integer("city_id").unique().notNull(),
  name: text("name").notNull(),
  state: text("state"),
  country: text("country").notNull(),
  displayName: text("display_name").notNull(),
  unaccentedName: text("unaccented_name").notNull(),
  lon: decimal("lon").notNull(),
  lat: decimal("lat").notNull()
})
