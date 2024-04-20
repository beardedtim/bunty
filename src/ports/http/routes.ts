import { z } from 'zod'
import PostRepository, { Schemas as PostSchemas } from '@app/repositories/posts'
import MoodRepository, { Schemas as MoodSchemas } from '@app/repositories/moods'
import AssociationRepository from '@app/repositories/associations'

import * as Association from '@app/domains/association'
import * as Posts from '@app/domains/posts'
import * as Moods from '@app/domains/moods'

import { Middleware } from './types'
import * as Errors from './errors'

export const getPostById: Middleware = async (ctx) => {
  const { id } = ctx.params

  ctx.log.trace(
    {
      id,
    },
    'Requesting to get Post By Id',
  )

  try {
    const result = await Posts.getById({
      repo: new PostRepository(ctx.db),
      id,
    })

    if (!result) {
      throw new Errors.NotFound()
    }

    ctx.status = 200

    ctx.body = {
      data: result,
    }
  } catch (err) {
    ctx.log.warn({ err, id }, 'Error when trying to find Post by ID')

    throw err
  }
}

const NewPostDTO = z.object({
  post: PostSchemas.Create,
  mood: MoodSchemas.Create,
})

export const createPost: Middleware = async (ctx) => {
  console.log(ctx.request.body, 'REQUEST')
  const { post, mood } = NewPostDTO.parse(ctx.request.body)

  const savedPost = await Posts.create({
    repo: new PostRepository(ctx.db),
    dto: post,
    publish: async (event) => {
      await ctx.cache.publish(event)
    },
  })

  const savedMood = await Moods.create({
    repo: new MoodRepository(ctx.db),
    dto: mood,
    publish: async (event) => {
      await ctx.cache.publish(event)
    },
  })

  // associate each other
  await Association.moodReferences({
    type: 'post',
    repo: new AssociationRepository(ctx.db),
    ids: {
      mood: savedMood.id,
      post: savedPost.id,
    },
  })

  ctx.status = 201

  ctx.body = {
    data: {
      post: savedPost,
      mood: savedMood,
    },
  }
}
