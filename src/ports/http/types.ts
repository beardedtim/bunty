import Koa, { DefaultContext } from 'koa'
import { Middleware as BaseMiddleware } from 'koa'

import Logger from '@app/infra/log'
import { Queues } from '@app/connections/queues'
import * as Cache from '@app/connections/cache'
import { Database } from 'arangojs'
import { render } from '@app/views'

export type Context = {
  log: typeof Logger
  db: Database
  cache: typeof Cache
  queues: typeof Queues
  /**
   * Pulled from the URL via the routing middleware
   */
  params: {
    [x: string]: string
  }
} & DefaultContext

export interface State {}

export type AppType = Koa<State, Context>
export type Middleware = BaseMiddleware<State, Context>
