import AssociationRepository from '@app/repositories/associations'
import type { UUID } from '@app/types'

export interface Association {
  from: string
  to: string
}

export interface AssociatePostWithMoodCmd {
  type: 'post'
  repo: AssociationRepository
  ids: {
    mood: UUID
    post: UUID
  }
}

export type MoodReferencesCmd = AssociatePostWithMoodCmd

export const moodReferences = (cmd: MoodReferencesCmd) => {
  switch (cmd.type) {
    case 'post':
      const { repo, ids } = cmd
      return repo.create({ from: ids.mood, to: ids.post })
  }
}
