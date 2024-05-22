import dotenv from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { v4 as uuid } from "uuid"
import { city } from "./schema"
import cities from "./data/city.list.json"

dotenv.config()

const connectionString = process.env.DATABASE_URL ?? ""

const client = postgres(connectionString, { max: 1 })

const db = drizzle(client)

async function seed() {
  if (!Array.isArray(cities)) {
    throw new Error("Invalid cities data. Expected an array.")
  }

  for (let i = 0; i < cities.length; i++) {
    const cityData = cities[i]

    await db.insert(city).values({
      id: uuid(),
      cityId: cityData.id,
      name: cityData.name,
      state: cityData.state ?? null,
      country: cityData.country,
      lon: cityData.coord.lon,
      lat: cityData.coord.lat
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
