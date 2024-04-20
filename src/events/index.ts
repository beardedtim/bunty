import { z } from 'zod'

export const NewPostEventSchema = z.object({
  type: z.literal('@@POSTS/NEW'),
  payload: z.object({
    id: z.string().uuid(),
  }),
})

export const NewMoodEntryEventSchema = z.object({
  type: z.literal('@@MOOD_ENTRIES/NEW'),
  payload: z.object({
    id: z.string().uuid(),
  }),
})

export type NewPostEvent = z.infer<typeof NewPostEventSchema>

export const EventSchema = z.discriminatedUnion('type', [
  NewPostEventSchema,
  NewMoodEntryEventSchema,
])

export type Event = z.infer<typeof EventSchema>

/**
 * Given some Event that we want to emit, returns the
 * encoded version of that Event so it can be transmitted
 * over the transport
 */
export const encode = (data: Event): string => JSON.stringify(data)

/**
 * Given some Event Message from the transport, returns
 * the decoded version
 */
export const decode = (msg: string): Event => JSON.parse(msg)
