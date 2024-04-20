import R from 'ramda'
import { z } from 'zod'
import * as Errors from '@app/infra/errors'
import { Database, aql } from 'arangojs'
import { randomUUID } from 'crypto'

export const Schemas = {
  Create: z.object({
    level: z
      .number()
      .min(-5)
      .max(5)
      .describe('-5 = extremely negative, 5 = extremely positive'),
    description: z.string().describe('Words describing the current level'),
  }),
  Read: z.object({
    id: z.string().uuid().describe('The UUID of this specific Mood Entry'),
    level: z
      .number()
      .min(-5)
      .max(5)
      .describe('-5 = extremely negative, 5 = extremely positive'),
    description: z.string().describe('Words describing the current level'),
    logged_at: z
      .string()
      .datetime()
      .describe('When this Mood was logged into the system'),
  }),
}

export type NewMood = z.infer<typeof Schemas.Create>
export type Mood = z.infer<typeof Schemas.Read>

export class MoodRepository {
  #database: Database

  constructor(db: Database) {
    this.#database = db
  }

  async create(dto: NewMood): Promise<Mood> {
    const data: Mood = {
      id: randomUUID({ disableEntropyCache: true }),
      ...dto,
      logged_at: new Date().toISOString(),
    }

    await this.#database.query(aql`
      INSERT ${data} INTO MoodEntries
    `)

    return data
  }

  async byId(id: string): Promise<Mood> {
    const result = await this.#database.query<Mood>(aql`
      FOR doc IN MoodEntries
        FILTER doc.id == ${id}
        LIMIT 1
        RETURN doc
    `)

    for await (const mood of result) {
      // return a single value from that even
      // though it returns an ArrayCursor
      return R.pick(['id', 'level', 'description', 'logged_at'], mood)
    }

    throw new Errors.DomainEntityNotFound('MoodEntries', id)
  }
}

export default MoodRepository
