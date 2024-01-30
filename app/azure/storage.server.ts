import {
  BlobServiceClient,
  StorageSharedKeyCredential
} from "@azure/storage-blob"
import { Readable } from "node:stream"

const createBlobStorageClient = () => {
  const url = process.env.STORAGE_URL ?? ""
  const accountName = process.env.STORAGE_ACCOUNT_NAME ?? ""
  const accountKey = process.env.STORAGE_ACCOUNT_KEY ?? ""

  return new BlobServiceClient(
    url,
    new StorageSharedKeyCredential(accountName, accountKey)
  )
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
