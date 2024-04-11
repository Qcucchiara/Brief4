const { Listing } = require('../Model/Listing')
const client = require('../Service/DbConnection')
const { ObjectId } = require('bson')

require('dotenv').config()

const createListing = async (req, res) => {
  if (
    !req.body.userId ||
    !req.body.title ||
    !req.body.description ||
    !req.body.image ||
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
      []
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
  // TODO
}

const deleteListing = async (req, res) => {
  // TODO
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
}

module.exports = {
  createListing,
  editListing,
  deleteListing,
  getOneListing,
  getAllListing,
  getListingsFromUser,
}
