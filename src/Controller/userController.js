const { User } = require('../Model/User')
const client = require('../Service/DbConnection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('bson')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const register = async (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.name) {
    res.status(400).json({ error: 'Some fields are missing' })
    return
  }
  const hashedPassword = await bcrypt.hash(req.body.password + '', 10)
  try {
    let user = await client
      .db('brief_4')
      .collection('user')
      .findOne({ email: req.body.email })

    if (user) {
      if (req.body.email == user.email) {
        res.status(400).json({ error: 'email already used', status: 400 })
        return
      }
    }
    let newUser = new User(
      req.body.email,
      hashedPassword,
      req.body.name,
      'user',
      new Date(),
      new Date(),
      true
    )
    let result = await client
      .db('brief_4')
      .collection('user')
      .insertOne(newUser)

    const token = jwt.sign(
      {
        _id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
      },
      process.env.SECRET_KEY
    )

    res.status(200).json({ jwt: token })
  } catch (error) {
    res.status(500).json(error.stack)
  }
}

const login = async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).json({ error: 'Some fields are missing' })
    return
  }
  try {
    let user = await client
      .db('brief_4')
      .collection('user')
      .findOne({ email: req.body.email })

    if (!user) {
      res.status(401).json({ error: 'Wrong credentials' })
      return
    }

    const isValidPasswod = bcrypt.compare(req.body.password, user.password)

    if (!isValidPasswod) {
      res.status(401).json({ error: 'Wrong credentials' })
    } else {
      const token = jwt.sign(
        // user,
        {
          _id: user._id,
          name: user.name,
          email: user.email,
          // password: user.password,
        },
        process.env.SECRET_KEY
      )

      res.status(200).json({
        jwt: token,
      })
    }
  } catch (error) {
    res.status(500).json(error.stack)
  }
}

module.exports = { register, login }
