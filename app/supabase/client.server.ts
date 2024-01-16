import { createClient, SupabaseClient } from "@supabase/supabase-js"

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

export { createSupabaseClient }
