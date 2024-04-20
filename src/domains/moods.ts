import Logger from '@app/infra/log'
import MoodRepository, { NewMood } from '@app/repositories/moods'
/**
 * This is the MoodEntry Entity Object
 */
export interface MoodEntry {
  id: string
  level: number
  description: string
  logged_at: string
}

/**
 * These are the Events that this MoodEntry system
 * will publish
 */

/**
 * This Event will be published when there is a new
 * MoodEntry Entity Object created
 */
export interface NewMoodEntryEvent {
  type: '@@MOOD_ENTRIES/NEW'

  payload: {
    /**
     * The ID of the MoodEntry that was created
     */
    id: string
  }
}

/**
 * These are the commands that we can run
 * against the Mood Domain that will work
 * on and return the MoodEntry Entity Object
 */

/**
 * Create Command
 *
 * Requests the system to create a new MoodEntry Entity Object
 */
export interface CreateCmd {
  repo: MoodRepository
  publish: (event: NewMoodEntryEvent) => Promise<void>
  dto: NewMood
}

export const create = async ({
  repo,
  publish,
  dto,
}: CreateCmd): Promise<MoodEntry> => {
  const result = await repo.create(dto)

  const event: NewMoodEntryEvent = {
    type: '@@MOOD_ENTRIES/NEW',
    payload: {
      id: result.id,
    },
  }

  try {
    await publish(event)
  } catch (err) {
    Logger.warn(
      { err },
      'Error trying to publish NewMoodEntryEvent. However, the MoodEntry was already created so we are going to swallow this error.',
    )
  }

  return result
}

/**
 * By Id Command
 *
 * Requests from the system the current state of a MoodEntry Entity
 * Object by its given ID
 */
export interface ByIdCmd {
  id: string
}
