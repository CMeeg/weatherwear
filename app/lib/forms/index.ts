// TODO: Remove this if not used
class ValidationError extends Error {
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message)

    this.name = "ValidationError"

    this.fieldErrors = fieldErrors
  }
}

interface FormListItem {
  id: string
  name: string
}

export { ValidationError }

export type { FormListItem }
