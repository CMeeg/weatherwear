type Nullable<T> = T | null

type OkFuncResult<T> = [T, undefined]
type ErrorFuncResult<T extends Error> = [undefined, T]

type FuncResult<
  TData,
  TError extends Error = { name: string; message: string }
> = OkFuncResult<TData> | ErrorFuncResult<TError>

interface FuncResultFactory {
  ok: <T>(data: T) => OkFuncResult<T>
  error: <T extends Error>(err: T) => ErrorFuncResult<T>
}

function createFuncResultFactory(): FuncResultFactory {
  return {
    ok: (data) => [data, undefined],
    error: (err) => [undefined, err]
  }
}

const result = createFuncResultFactory()

export { result }

export type { Nullable, FuncResult }
