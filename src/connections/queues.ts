import { Queue } from 'bullmq'
import getenv from 'getenv'
import Logger from '@app/infra/log'

export enum QueueName {
  ProcessPost = 'ProcessPost',
}

export const Queues = new Map<QueueName, Queue>()

export const connect = async () => {
  Object.values(QueueName).forEach((queueName) => {
    Logger.trace({ queueName }, 'Connecting to a Queue')

    Queues.set(
      queueName,
      new Queue(queueName, {
        connection: {
          host: getenv.string('CACHE_HOST'),
          port: getenv.int('CACHE_PORT'),
          password: getenv.string('CACHE_PASS'),
        },
      }),
    )
  })
}

export const disconnect = async () => {
  for (const [queueName, queue] of Queues.entries()) {
    Logger.trace({ queueName }, 'Disconnecting from a Queue')
    await queue.close()
  }
}
