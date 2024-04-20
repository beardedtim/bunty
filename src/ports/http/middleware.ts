import { Middleware } from 'koa'
import * as InternalErrors from '@app/infra/errors'

import * as HTTPErrors from './errors'

export const errorHandler: Middleware = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    if (err instanceof InternalErrors.NotImplemented) {
      ctx.log.warn(
        { err },
        'Error due to something being implemented. May want to look into this',
      )

      ctx.status = 500
      ctx.body = {
        error: {
          message: 'Internal Server Error',
        },
      }
    } else if (err instanceof InternalErrors.DomainEntityNotFound) {
      ctx.status = 404
      ctx.body = {
        error: {
          message: err.message,
        },
      }
    } else if (err instanceof HTTPErrors.NotFound) {
      ctx.status = 404
      ctx.body = {
        error: {
          message: err.message,
        },
      }
    }
  }
}
