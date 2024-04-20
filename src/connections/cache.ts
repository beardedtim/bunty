import Redis from 'ioredis'
import Logger from '@app/infra/log'
import getenv from 'getenv'
import { Event, EventSchema, decode, encode } from '@app/events'

const conn = new Redis({
  password: getenv.string('CACHE_PASS'),
  host: getenv.string('CACHE_HOST'),
  port: getenv.int('CACHE_PORT'),
  lazyConnect: true,
})

const subscriptions = new Map<string, Set<(event: Event) => unknown>>()

conn.on('message', async (channel, message) => {
  try {
    if (subscriptions.has(channel)) {
      // Don't even parse the message if we don't
      // currently have any subscriptions. We shouldn't
      // be here but if we do, it's probably because we're
      // in the middle of closing our connections/subscriptions
      const event = EventSchema.parse(decode(message))

      const handlers = [...(subscriptions.get(channel)?.values() ?? [])]

      // Can we call all handlers in "parallel"?
      await Promise.all(handlers.map((cb) => cb(event)))

      /**
       * If not, we would want something like
       *
       * for (const handler of subscriptions.get(channel)?.values() ?? []) {
       *  await handler(event)
       * }
       */
    }
  } catch (err) {
    Logger.warn({ err }, 'Error trying to process new message from PubSub')
  }
})

export const connect = async () => {
  try {
    await conn.connect()
  } catch (err) {
    Logger.warn({ err }, 'Could not connect to Cache')

    throw err
  }
}

export const disconnect = async () => {
  try {
    await conn.disconnect()
  } catch (err) {
    Logger.warn({ err }, 'Could not disconnect from Cache')

    throw err
  }
}

export const isHealthy = async () => {
  try {
    await conn.ping()

    return true
  } catch (e) {
    Logger.warn({ err: e }, 'Cache not healthy')
    return false
  }
}

export const publish = (event: Event) => {
  const msg = encode(event)

  return conn.publish(event.type, msg)
}

export const subscribe = (
  eventName: string,
  handler: (data: Event) => unknown,
) => {
  // If we already have handlers registered for
  // this event name, we add to the set
  if (subscriptions.has(eventName)) {
    subscriptions.get(eventName)?.add(handler)
  } else {
    // If we haven't seen it, we set the value
    subscriptions.set(eventName, new Set([handler]))
  }
}

export const unsubscribe = (
  eventName: string,
  handler: (dat: Event) => unknown,
) => {
  if (subscriptions.has(eventName)) {
    subscriptions.get(eventName)?.delete(handler)
  }
}

export const unsubscribeAll = async (eventName: string) => {
  if (subscriptions.has(eventName)) {
    // Allow GC of set
    subscriptions.delete(eventName)

    // and unsubscribe from events
    await conn.unsubscribe(eventName)
  }
}
