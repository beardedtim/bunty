import { Middleware } from '@app/ports/http/types'

export const renderHome: Middleware = async (ctx) => {
  ctx.state = {
    title: 'Bunty',
  }

  await ctx.render('pages/home', {
    actor: {
      name: 'Timbo',
    },
  })
}

export const renderCreateNewPost: Middleware = async (ctx) => {
  ctx.state = {
    title: 'Create Post | Bunty',
  }

  await ctx.render('pages/posts/new', {
    actor: {
      name: 'Timbo',
    },
  })
}
