class Listing {
  constructor(
    userId,
    title,
    description,
    images,
    dateEvent,
    maxParticipants,
    listParticipants
  ) {
    this.user_id = userId
    this.title = title
    this.description = description
    this.images = images
    this.date_event = dateEvent
    this.max_participants = maxParticipants
    this.list_participants = listParticipants
  }
}

module.exports = { Listing }
