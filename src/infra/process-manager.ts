import Logger from '@app/infra/log'

export type Handler = () => Promise<void> | void

class Manager {
  #handlers: Set<Handler>

  constructor() {
    this.#handlers = new Set()
  }

  /**
   * Pass handler to be called when the system shuts down
   * either due to SIGTERM or from uncaught errors
   *
   * @param handler Function to run when the system shuts down
   */
  onShutdown(handler: Handler) {
    this.#handlers.add(handler)

    return this
  }

  /**
   * Attaches the shutdown function to the uncaught error
   * and SIG* values
   */
  attachProcessHandlers() {
    // If any of these happen, we need to shutdown
    // the entire system
    process
      .on('unhandledRejection', this.shutdown.bind(this))
      .on('uncaughtException', this.shutdown.bind(this))
      .on('SIGTERM', () => this.shutdown())
      .on('SIGINT', () => this.shutdown())

    return this
  }

  async shutdown(err?: Error) {
    Logger.debug({ err }, 'Asked to shutdown. Calling all handlers')

    for (const handler of this.#handlers.values()) {
      try {
        await handler()
      } catch (innerErr) {
        Logger.warn({ err: innerErr }, 'Error trying to shutdown handler')
      }
    }

    Logger.trace('All handlers called. We are now going to close.')

    if (err) {
      Logger.fatal({ err }, 'Error caused shutdown. Exiting code 1')

      process.exit(1)
    } else {
      Logger.info('Asked to shutdown nicely. Exiting code 0. Goodbye')

      process.exit(0)
    }
  }
}

export default new Manager()
