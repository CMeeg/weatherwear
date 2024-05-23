import dotenv from "dotenv"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { readJson } from "fs-extra"
import path from "node:path"
import { v4 as uuid } from "uuid"
import { city } from "./schema"

dotenv.config()

const connectionString = process.env.DATABASE_URL ?? ""

const client = postgres(connectionString, { max: 1 })

const db = drizzle(client)

interface CityData {
  id: number
  name: string
  state: string
  country: string
  coord: {
    lon: number
    lat: number
  }
}

async function seed() {
  const cities = (await readJson(
    path.resolve(__dirname, "./data/city.list.json")
  )) as CityData[]

  if (!Array.isArray(cities)) {
    throw new Error("Invalid cities data. Expected an array.")
  }

  for (let i = 0; i < cities.length; i++) {
    const cityData = cities[i]

    const displayName = [cityData.name]

    if (city.state) {
      displayName.push(cityData.state)
    }

    displayName.push(cityData.country)

    await db.insert(city).values({
      id: uuid(),
      cityId: cityData.id,
      name: cityData.name,
      state: cityData.state ?? null,
      country: cityData.country,
      displayName: displayName.join(", "),
      unaccentedName: sql<string>`unaccent('${cityData.name}')`,
      lon: cityData.coord.lon.toString(),
      lat: cityData.coord.lat.toString()
    })
  }
}

async function main() {
  try {
    await seed()
    console.log("Seeding completed")
  } catch (error) {
    console.error("Error during seeding:", error)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main()
