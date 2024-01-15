import { createClient, SupabaseClient } from "@supabase/supabase-js"
import { result } from "~/lib/core"
import type { WearForecast } from "~/lib/wear"

let supabaseClient: SupabaseClient | undefined = undefined

const createSupabaseClient = (): SupabaseClient => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.SUPABASE_API_URL ?? "",
      process.env.SUPABASE_API_SERVICE_KEY ?? ""
    )
  }

  return supabaseClient
}

const uploadWearForecastImage = async (
  forecastId: string,
  imageData: string
) => {
  // Convert the base64 string to a blob
  const base64Response = await fetch(`data:image/png;base64,${imageData}`)
  const blob = await base64Response.blob()

  // Upload the blob to storage
  // TODO: You need a Pro plan for image transformations so maybe i am better off with Azure blob storage plus ImageKit?
  const { data, error } = await createSupabaseClient()
    .storage.from("forecast")
    .upload(forecastId, blob, { upsert: true })

  if (error) {
    return result.error(error)
  }

  // TODO: Actual return data doesn't match the type
  return result.ok(data as { path: string; id: string; fullPath: string })
}

const getForecastImageUrl = (forecast: WearForecast) => {
  const { data } = createSupabaseClient()
    .storage.from("forecast")
    .getPublicUrl(forecast.id)

  return data.publicUrl
}

export { uploadWearForecastImage, getForecastImageUrl }
