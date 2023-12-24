interface Locale {
  // TODO: Is there a more specific type to use for culture?
  culture: string
}

const defaultLocale: Locale = {
  culture: "en-GB"
}

export { defaultLocale }

export type { Locale }
