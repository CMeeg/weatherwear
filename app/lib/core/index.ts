type Nullable<T> = T | null | undefined

interface FuncError<TError> {
  message: string
  code?: string
  error?: TError | unknown
}

type FuncResult<TData, TError> = [
  TData | undefined,
  FuncError<TError> | undefined
]

interface FuncResultFactory {
  ok: <TData>(data: TData) => FuncResult<TData, undefined>
  error: <TError>(
    err: FuncError<TError>
  ) => FuncResult<undefined, FuncError<TError>>
}

function createFuncResultFactory(): FuncResultFactory {
  return {
    ok: (data) => [data, undefined],
    error: (err) => [undefined, err]
  }
}

const result = createFuncResultFactory()

export { result }

export type { Nullable, FuncResult, FuncError }
