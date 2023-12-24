type Nullable<T> = T | null | undefined

interface FuncError<T = unknown> {
  message: string
  code?: string
  error?: T
}

type OkFuncResult<T> = [T, undefined]
type ErrorFuncResult<T> = [undefined, FuncError<T>]

type FuncResult<TData, TError> = OkFuncResult<TData> | ErrorFuncResult<TError>

interface FuncResultFactory {
  ok: <T>(data: T) => OkFuncResult<T>
  error: <T>(err: FuncError<T>) => ErrorFuncResult<T>
}

function createFuncResultFactory(): FuncResultFactory {
  return {
    ok: <T>(data: T): OkFuncResult<T> => [data, undefined],
    error: <T>(err: FuncError<T>): ErrorFuncResult<T> => [undefined, err]
  }
}

const result = createFuncResultFactory()

export { result }

export type { Nullable, FuncResult, FuncError }
