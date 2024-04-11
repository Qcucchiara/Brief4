class Listing {
  constructor(
    user_id,
    title,
    description,
    images,
    dateEvent,
    maxParticipants,
    listParticipants
  ) {
    this.user_id = user_id
    this.title = title
    this.description = description
    this.images = images
    this.dateEvent = dateEvent
    this.maxParticipants = maxParticipants
    this.listParticipants = listParticipants
  }
}

module.exports = { Listing }
