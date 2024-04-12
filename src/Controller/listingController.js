const { Listing } = require('../Model/Listing')
const client = require('../Service/DbConnection')
const { ObjectId } = require('bson')
const { extractToken } = require('../Utils/extractToken')

require('dotenv').config()

const createListing = async (req, res) => {
  if (
    !req.body.user_id ||
    !req.body.title ||
    !req.body.description ||
    !req.body.images ||
    !req.body.date_event ||
    !req.body.max_participants
  ) {
    res.status(400).json({ error: 'Some fields are missing' })
    return
  }
  try {
    let listing = await client
      .db('brief_4')
      .collection('listing')
      .findOne({ title: req.body.title })

    if (listing) {
      if (req.body.title == listing.title) {
        res.status(400).json({ error: 'title already used', status: 400 })
        return
      }
    }
    let newListing = new Listing(
      req.body.user_id,
      req.body.title,
      req.body.description,
      req.body.images,
      req.body.date_event,
      req.body.max_participants,
      req.body.list_participants
    )
    let result = await client
      .db('brief_4')
      .collection('listing')
      .insertOne(newListing)
    res.status(200).json(result)
  } catch (error) {
    res.status(500).json(error.stack)
  }
}

const editListing = async (req, res) => {
  const token = await extractToken(req)
  if (
    // !req.body.userId ||
    !req.body.title ||
    !req.body.description ||
    !req.body.images ||
    !req.body.date_event ||
    !req.body.max_participants
  ) {
    res.status(400).json({ error: 'Some fields are missing' })
    return
  }

  let user = await client
    .db('brief_4')
    .collection('user')
    .findOne({ _id: new ObjectId(req.params.userId) })

  let listing = await client
    .db('brief_4')
    .collection('listing')
    .findOne({ _id: new ObjectId(req.params.listingId) })

  if (!user || !listing) {
    console.log('')
    res.status(401).json({ error: 'Unauthorized 1' })
    return
  }

  if (listing.user_id + '' !== user._id + '' || user.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized 2' })
    console.log(user._id)
    console.log(listing.user_id)
    return
  }

  try {
    await client
      .db('brief_4')
      .collection('listing')
      .updateOne(
        { user_id: req.params.userId },
        {
          $set: {
            title: req.body.title,
            description: req.body.description,
            images: req.body.images,
            date_event: req.body.date_event,
            max_participants: req.body.max_participants,
          },
        }
      )
    const newListing = await client
      .db('brief_4')
      .collection('listing')
      .findOne({ user_id: req.params.userId })
    res.status(200).json(newListing)
  } catch (error) {
    res.status(500).json(error.stack)
  }
}

const deleteListing = async (req, res) => {
  // TODO

  try {
    let listing = await client
      .db('brief_4')
      .collection('listing')
      .deleteOne({ _id: new ObjectId(req.body._id) })
    res.status(200).json(listing)
  } catch (e) {
    console.log(e)
    res.status(500).json(e)
  }
}

const getOneListing = async (req, res) => {
  let listing = await client
    .db('brief_4')
    .collection('listing')
    .findOne({ _id: new ObjectId(req.body._id) })

  res.status(200).json(listing)
}

const getAllListing = async (req, res) => {
  let listings = await client
    .db('brief_4')
    .collection('listing')
    .find()
    .toArray()
  res.status(200).json(listings)
}

const getListingsFromUser = async (req, res) => {
  // TODO
  let listings = await client
    .db('brief_4')
    .collection('listing')
    .find({ user_id: req.body.user_id })
    .toArray()
  res.status(200).json(listings)
}

module.exports = {
  createListing,
  editListing,
  deleteListing,
  getOneListing,
  getAllListing,
  getListingsFromUser,
}
