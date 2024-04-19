class Listing {
  constructor(
    userId,
    title,
    description,
    image,
    dateEvent,
    maxParticipants,
    listParticipants
  ) {
    this.user_id = userId;
    this.title = title;
    this.description = description;
    this.image = image;
    this.date_event = dateEvent;
    this.max_participants = maxParticipants;
    this.list_participants = listParticipants;
  }
}

module.exports = { Listing };
