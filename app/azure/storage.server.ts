import { BlobServiceClient } from "@azure/storage-blob"
import { Readable } from "node:stream"

const createBlobStorageClient = () => {
  const connectionString = process.env.STORAGE_CONNECTION_STRING ?? ""

  return BlobServiceClient.fromConnectionString(connectionString)
}

const createReadableStreamFromBody = (
  body: ReadableStream<Uint8Array> | null
) => {
  const bodyIterable: AsyncIterable<unknown> = {
    [Symbol.asyncIterator]() {
      const reader = body?.getReader()
      return {
        async next() {
          const { done, value } = (await reader?.read()) ?? {
            done: true,
            value: undefined
          }
          return { done, value }
        }
      }
    }
  }

  return Readable.from(bodyIterable, {
    objectMode: false,
    highWaterMark: 16
  })
}

export { createBlobStorageClient, createReadableStreamFromBody }
