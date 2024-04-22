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
              <li key={name}>
                {Array.isArray(error) ? (
                  <ul>
                    {error.map((message) => (
                      <li key={`${name}_${message}`}>
                        <span className={css.error}>{message}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className={css.error}>{error}</span>
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
