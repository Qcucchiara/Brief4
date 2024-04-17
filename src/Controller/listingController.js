const { Listing } = require('../Model/Listing');
const client = require('../Service/DbConnection');
const { ObjectId } = require('bson');
const { extractToken } = require('../Utils/extractToken');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const createListing = async (req, res) => {
  if (
    !req.body.title ||
    !req.body.description ||
    !req.body.date_event ||
    !req.body.max_participants
  ) {
    res.status(400).json({ error: 'Some fields are missing' });
    return;
  }
  try {
    const token = await extractToken(req);
    jwt.verify(token, process.env.SECRET_KEY, async (err, authData) => {
      if (err) {
        res.status(401).json({ err: 'Unauthorized' });
        return;
      } else {
        let listing = await client
          .db('brief_4')
          .collection('user')
          .findOne({ _id: new ObjectId(authData._id) });

        let newListing = new Listing(
          listing._id,
          req.body.title,
          req.body.description,
          req.body.images,
          req.body.date_event,
          req.body.max_participants,
          req.body.list_participants
        );
        let result = await client
          .db('brief_4')
          .collection('listing')
          .insertOne(newListing);
        res.status(200).json(result);
      }
    });
  } catch (error) {
    res.status(500).json(error.stack);
  }
};

const editListing = async (req, res) => {
  const token = await extractToken(req);
  if (
    // !req.body.userId ||
    !req.body.title ||
    !req.body.description ||
    !req.body.date_event || //ne devrait pas pouvoir modifier la date ultérieurement
    !req.body.max_participants
  ) {
    res.status(400).json({ error: 'Some fields are missing' });
    return;
  }

  let user = await client
    .db('brief_4')
    .collection('user')
    .findOne({ _id: new ObjectId(req.params.userId) });

  let listing = await client
    .db('brief_4')
    .collection('listing')
    .findOne({ _id: new ObjectId(req.params.listingId) });

  if (!user || !listing) {
    res.status(401).json({ error: 'Unauthorized 1' });
    return;
  }

  if (listing.user_id + '' !== user._id + '' || user.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized 2' });
    return;
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
      );
    const newListing = await client
      .db('brief_4')
      .collection('listing')
      .findOne({ user_id: req.params.userId });
    res.status(200).json(newListing);
  } catch (error) {
    res.status(500).json(error.stack);
  }
};

const addUserToListing = async (req, res) => {
  try {
    const token = await extractToken(req);
    jwt.verify(token, process.env.SECRET_KEY, async (err, authData) => {
      if (err) {
        res.status(401).json({ err: 'Unauthorized' });
        return;
      } else {
        const listing = await client
          .db('brief_4')
          .collection('listing')
          .findOne({ _id: new ObjectId(req.body._id) });

        let listParticipants = await listing.list_participants;
        if (listParticipants.length >= Number(listing.max_participants)) {
          res.status(400).json({ err: 'already full' });
          return;
        }

        if (listParticipants.includes(authData)) {
          res.status(400).json({ err: 'already registered' });
          return;
        } else {
          listParticipants.push(authData);
        }
        await client
          .db('brief_4')
          .collection('listing')
          .updateOne(
            { _id: new ObjectId(req.body._id) },
            {
              $set: {
                list_participants: listParticipants,
              },
            }
          );
        res.status(200).json({ list_participants: listParticipants });
      }
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteListing = async (req, res) => {
  try {
    const token = await extractToken(req);
    jwt.verify(token, process.env.SECRET_KEY, async (err, authData) => {
      console.log({ authData: authData._id });
      if (err) {
        res.status(401).json({ err: 'Unauthorized' });
        return;
      } else {
        const listingToDelete = await client
          .db('brief_4')
          .collection('listing')
          .findOne({ _id: new ObjectId(req.body._id) });

        if (!listingToDelete) {
          res.status(401).json({ error: 'butterfly is already dead' });
          return;
        }

        const listing = await client
          .db('brief_4')
          .collection('listing')
          .deleteOne({ _id: new ObjectId(req.body._id) });

        if (!listing) {
          res.status(401).json({ error: 'Unauthorized butterfly 1' });
          return;
        }

        if (listingToDelete.user_id + '' !== authData._id + '') {
          res.status(401).json({ error: 'Unauthorized butterfly 2' });
          return;
        } else {
          res.status(200).json(listing);
        }
      }
    });
  } catch (e) {
    res.status(500).json(e);
  }
};

const getOneListing = async (req, res) => {
  let listing = await client
    .db('brief_4')
    .collection('listing')
    .findOne({ _id: new ObjectId(req.body._id) });

  res.status(200).json(listing);
};

const getAllListing = async (req, res) => {
  try {
    let listings = await client
      .db('brief_4')
      .collection('listing')
      .find()
      .toArray();

    res.status(200).json(listings);
  } catch (error) {
    res.status(500).json(error.stack);
  }
};

const getListingsFromUser = async (req, res) => {
  // TODO
  let listings = await client
    .db('brief_4')
    .collection('listing')
    .find({ user_id: req.body.user_id })
    .toArray();
  res.status(200).json(listings);
};

module.exports = {
  createListing,
  editListing,
  deleteListing,
  getOneListing,
  getAllListing,
  getListingsFromUser,
  addUserToListing,
};
