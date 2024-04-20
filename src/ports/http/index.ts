import R from 'ramda'
import Koa from 'koa'
import BodyParser from 'koa-body'
import ReqLogger from 'koa-pino-logger'
import Static from 'koa-static'

import { getDb } from '@app/connections/datastore'
import * as Cache from '@app/connections/cache'
import Logger from '@app/infra/log'
import { Queues } from '@app/connections/queues'
import { render as UIRendering } from '@app/views'

import { Database } from 'arangojs'
import { AppType } from './types'
import Router from './router'
import * as Middleware from './middleware'
import { PUBLIC_DIR } from '@app/CONST'

const createBase = (): AppType => new Koa()

const applyContext = (app: AppType): AppType => {
  app.context.log = Logger.child({
    name: 'HTTP Port',
  })

  app.context.db = getDb() as Database
  app.context.cache = Cache
  app.context.queues = Queues

  return app
}

const applyMiddleware = (app: AppType): AppType =>
  app
    .use(Middleware.errorHandler)
    .use(BodyParser())
    .use(
      ReqLogger({
        logger: Logger.child({ name: 'HTTP Request' }) as any,
      }),
    )
    .use(UIRendering)

const applyRoutes = (app: AppType): AppType =>
  app.use(Router.routes()).use(Router.allowedMethods()) as any as AppType

const applyStaticRendering = (app: AppType): AppType =>
  app.use(Static(PUBLIC_DIR))

export const create = R.pipe(
  createBase,
  // Should be before middleware
  applyContext,
  applyMiddleware,
  // Should come after middleware
  applyRoutes,
  // Should be last
  applyStaticRendering,
)
