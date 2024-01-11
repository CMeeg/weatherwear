class ValidationError extends Error {
  fieldErrors: Record<string, string>

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message)

    this.name = "ValidationError"

    this.fieldErrors = fieldErrors
  }
}

export { ValidationError }
