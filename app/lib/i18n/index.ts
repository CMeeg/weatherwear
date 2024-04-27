interface Locale {
  // TODO: Is there a more specific type to use for culture?
  culture: string
  direction: "ltr" | "rtl"
}

const defaultLocale: Locale = {
  culture: "en-GB",
  direction: "ltr"
}

export { defaultLocale }

export type { Locale }
