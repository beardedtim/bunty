import PostRepository, { NewPost } from '@app/repositories/posts'
import Logger from '@app/infra/log'

/**
 * This is the Post Entity Object
 */
export interface Post {
  id: string
  title: string
  body: string
  created_at: string
  last_updated?: string
}

/**
 * These are the Events that this system will publish
 */

/**
 * This Event will be published when there is a new
 * Post Entity Object created
 */
export interface NewPostEvent {
  type: '@@POSTS/NEW'

  payload: {
    /**
     * The ID of the Post that was created
     */
    id: string
  }
}

/**
 * These are the commands that we can run
 * against the Posts Domain that will work
 * on and return the Post Entity Object
 */

/**
 * Create Command
 *
 * Requests the system to create a new Post Entity Object
 */
export interface CreateCmd {
  repo: PostRepository
  publish: (event: NewPostEvent) => Promise<void>
  dto: NewPost
}

export const create = async ({
  repo,
  dto,
  publish,
}: CreateCmd): Promise<Post> => {
  const result = await repo.create(dto)

  const event: NewPostEvent = {
    type: '@@POSTS/NEW',
    payload: {
      id: result.id,
    },
  }

  try {
    await publish(event)
  } catch (err) {
    Logger.warn(
      { err },
      'Error trying to publish NewPostEvent. However, the Post was already created so we are going to swallow this error.',
    )
  }

  return result
}

/**
 * By Id Command
 *
 * Requests from the system the current state of a Post Entity
 * Object by its given ID
 */
export interface ByIdCmd {
  repo: PostRepository
  id: string
}

export const getById = ({ repo, id }: ByIdCmd): Promise<Post> => repo.byId(id)
