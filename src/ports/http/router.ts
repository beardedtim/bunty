import Router from 'koa-router'

import { applyRoutes } from '@app/views'
import * as APIRoutes from './routes'
import { Context, State } from './types'

const router = new Router<State, Context>()

const apiRouter = new Router<State, Context>({
  prefix: '/api/v1',
})

apiRouter
  .get('/posts/:id', APIRoutes.getPostById)
  .post('/posts', APIRoutes.createPost)

const uiRouter = applyRoutes(new Router<State, Context>())

router.use(apiRouter.routes()).use(uiRouter.routes())

export default router
