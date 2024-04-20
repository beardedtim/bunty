import Router from 'koa-router'
import Views from '@ladjs/koa-views'

import * as Routes from './routes'
import { Context, State } from '@app/ports/http/types'

export const render = Views(__dirname + '/templates', {
  map: {
    html: 'htmling',
  },
})

export const applyRoutes = (router: Router<State, Context>) =>
  router
    .get('/', Routes.renderHome)
    .get('/posts/new', Routes.renderCreateNewPost)
