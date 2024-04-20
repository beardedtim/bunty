export class NotFound extends Error {
  status = 404
  constructor() {
    super()

    this.message =
      'We could not find a resources at that URL. Please change your URL before trying again'
  }
}
