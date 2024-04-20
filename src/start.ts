import Logger from '@app/infra/log'
import ProcessManager from '@app/infra/process-manager'
import * as Cache from '@app/connections/cache'
import * as Database from '@app/connections/datastore'
import * as Queues from '@app/connections/queues'
import { create as createServer } from './ports/http'
import getenv from 'getenv'

const init = async () => {
  Logger.trace(
    'System being started. Running any setup such as connecting to datastores or pinging home',
  )

  ProcessManager.onShutdown(Queues.disconnect)
    .onShutdown(Cache.disconnect)
    .onShutdown(Database.disconnect)
    .attachProcessHandlers()

  await Cache.connect()
  await Database.connect()
  await Queues.connect()

  Logger.trace('System has been set up. Now starting main systems')
}

const main = async () => {
  Logger.trace('Main systems being started')

  const server = createServer()
  const port = getenv.int('PORT')

  server.listen(port, () => {
    Logger.debug({ port }, 'System open for connections')
  })
}

init()
  .then(main)
  .then(() => {
    Logger.info('System fully started')
  })
  .catch(async (err) => {
    Logger.fatal({ err }, 'Error during start up. Bailing')

    await ProcessManager.shutdown(err)
  })
