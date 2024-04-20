import R from 'ramda'
import { z } from 'zod'
import * as Errors from '@app/infra/errors'
import { Database, aql } from 'arangojs'
import { randomUUID } from 'crypto'

export const Schemas = {
  Create: z.object({
    title: z.string().describe('The title of the post we are creating'),
    body: z
      .string()
      .describe('The body of the post that may contain HTML or Markdown'),
  }),
  Read: z.object({
    id: z.string().uuid().describe('Global UUID of the Post'),
    title: z.string().describe('The title of the post'),
    body: z
      .string()
      .describe('The body of the post that may contain HTML or Markdown'),
    created_at: z
      .string()
      .datetime()
      .describe('The time this post was first stored'),
    last_updated: z
      .string()
      .datetime()
      .describe('The time this post was last updated')
      .optional(),
  }),
}

export type NewPost = z.infer<typeof Schemas.Create>
export type Post = z.infer<typeof Schemas.Read>

export class PostRepository {
  #database: Database

  constructor(db: Database) {
    this.#database = db
  }

  async create(dto: NewPost): Promise<Post> {
    const data: Post = {
      id: randomUUID({ disableEntropyCache: true }),
      ...dto,
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString(),
    }

    await this.#database.query(aql`
      INSERT ${data} INTO Posts
    `)

    return data
  }

  async byId(id: string): Promise<Post> {
    const result = await this.#database.query<Post>(aql`
      FOR doc IN Posts
        FILTER doc.id == ${id}
        LIMIT 1
        RETURN doc
    `)

    for await (const post of result) {
      // return a single value from that even
      // though it returns an ArrayCursor
      return R.pick(['id', 'title', 'body', 'created_at', 'last_updated'], post)
    }

    throw new Errors.DomainEntityNotFound('Posts', id)
  }
}

export default PostRepository
