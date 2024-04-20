export class NotImplemented extends Error {
  code = 1000

  constructor(method: string) {
    super()

    this.message = `Cannot perform "${method}" because no one has told me how. Please implement "${method}" and try again.`
  }
}

export class DomainEntityNotFound extends Error {
  code = 1001

  constructor(entity: string, id: string) {
    super()

    this.message = `Cannot find "${entity}" with ID "${id}". Please check why you are trying to use wrong information`
  }
}
