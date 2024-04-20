import { Database } from 'arangojs'
import getenv from 'getenv'

let db: Database | undefined

export const connect = () => {
  db = new Database({
    url: `http://${getenv.string('DATASTORE_HOST')}:${getenv.int('DATASTORE_PORT')}`,
    auth: {
      username: getenv.string('DATASTORE_USER'),
      password: getenv.string('DATASTORE_PASS'),
    },
  })
}

export const disconnect = () => {
  db?.close()

  db = undefined
}

export const getDb = () => db
