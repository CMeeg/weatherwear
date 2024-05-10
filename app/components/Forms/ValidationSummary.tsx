import css from "./ValidationSummary.module.css"

type ValidationError = string | string[]
type ValidationErrors = Record<string, ValidationError>

interface ValidationSummaryProps {
  heading?: string
  errors?: ValidationErrors
}

function ValidationSummary({ heading, errors }: ValidationSummaryProps) {
  return (
    <>
      {errors && (
        <div className={css.container}>
          {heading && <p className="h4">{heading}</p>}

          <ul className={css.errors}>
            {Object.entries(errors).map(([name, error]) => (
              <li key={name} className={css.error}>
                {Array.isArray(error) ? (
                  <ul className={css.errors}>
                    {error.map((message) => (
                      <li key={`${name}_${message}`} className={css.error}>
                        <span className={css.message}>{message}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={css.message}>{error}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export { ValidationSummary }

export type { ValidationSummaryProps }
