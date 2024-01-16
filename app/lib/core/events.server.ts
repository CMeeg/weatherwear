import { EventEmitter } from "node:events"

const createEventEmitter = <T>(eventName: string) => {
  const emitter = new EventEmitter()

  return {
    emit: (event: T) => {
      emitter.emit(eventName, event)
    },
    on: (handler: (event: T) => void) => {
      emitter.on(eventName, handler)
    },
    off: (handler: (event: T) => void) => {
      emitter.off(eventName, handler)
    }
  }
}

export { createEventEmitter }
