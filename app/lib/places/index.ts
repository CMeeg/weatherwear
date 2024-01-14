interface LocationItem {
  id: string
  name: string
}

interface LocationsApiResponse {
  items: LocationItem[]
  error?: string
}

export type { LocationItem, LocationsApiResponse }
