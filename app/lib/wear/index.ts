interface WearProfile {
  subject: string
  fit: string
  style: string
}

interface WearSuggestion {
  advice: string
  description: string
  weather: string
}

export type { WearProfile, WearSuggestion }
