import { Database, aql } from 'arangojs'
import { z } from 'zod'

export const Schemas = {
  Create: z.object({
    to: z.string(),
    from: z.string(),
  }),
  Read: z.object({
    from: z.string(),
    to: z.string(),
  }),
}

export type NewAssociation = z.infer<typeof Schemas.Create>
export type Association = z.infer<typeof Schemas.Read>

class AssociationRepository {
  #database: Database
  constructor(db: Database) {
    this.#database = db
  }

  async create(dto: NewAssociation): Promise<Association> {
    const data: Association = {
      ...dto,
    }

    await this.#database.query(aql`
        FOR m IN MoodEntries
        FOR p IN Posts
            FILTER 
                m.id == ${data.from}
            AND     
                p.id == ${data.to}
            INSERT { _from: m._id, _to: p._id } INTO RelatesTo
    `)

    return data
  }
}

export default AssociationRepository
