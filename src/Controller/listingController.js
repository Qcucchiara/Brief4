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
      let user = await client
        .db('brief_4')
        .collection('user')
        .findOne({ _id: new ObjectId(authData._id) });
      if (err) {
        res.status(401).json({ err: 'Unauthorized' });
        return;
      }
      if (!user) {
        res.status(401).json({ err: 'not logged in' });
        return;
      } else {
        let newListing = new Listing(
          user._id,
          req.body.title,
          req.body.description,
          req.body.image,
          req.body.date_event,
          req.body.max_participants,
          []
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
  jwt.verify(token, process.env.SECRET_KEY, async (err, authData) => {
    if (err) {
      res.status(401).json({ err: 'Unauthorized' });
      return;
    } else {
      // __________________V a modifier V________________________
      if (
        !req.body.title ||
        !req.body.description ||
        // !req.body.date_event || //ne devrait pas pouvoir modifier la date ultérieurement
        !req.body.max_participants
      ) {
        res.status(400).json({ error: 'Some fields are missing' });
        return;
      }

      const listing = await client
        .db('brief_4')
        .collection('listing')
        .findOne({ _id: new ObjectId(req.params.listingId) });

      if (!listing) {
        res.status(401).json({ error: 'Unauthorized 1' });
        return;
      }
      console.log({ authData: authData });
      if (listing.user_id + '' !== authData._id + '') {
        // if (listing.user_id + '' !== authData._id + '' || user.role !== 'admin') {

        res.status(401).json({ error: 'Unauthorized 2' });
        return;
      }

      try {
        await client
          .db('brief_4')
          .collection('listing')
          .updateOne(
            { _id: new ObjectId(req.params.listingId) },
            {
              $set: {
                title: req.body.title,
                description: req.body.description,
                image: req.body.image,
                date_event: req.body.date_event,
                max_participants: req.body.max_participants,
              },
            }
          );
        console.log({ listing: listing });
        res.status(200).json({ client: client, listing: listing });
      } catch (error) {
        res.status(500).json(error.stack);
      }
      // __________________^ a modifier ^________________________    }
    }
  });
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
        console.log(authData);
        console.log(listParticipants.includes(authData));

        const contain = listParticipants.some((element) => {
          return JSON.stringify(authData) === JSON.stringify(element);
        });

        if (contain) {
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
  const token = await extractToken(req);
  jwt.verify(token, process.env.SECRET_KEY, async (err, authData) => {
    let listings = await client
      .db('brief_4')
      .collection('listing')
      .find({ user_id: new ObjectId(authData._id) })
      .toArray();
    console.log(authData._id);
    res.status(200).json(listings);
  });
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
