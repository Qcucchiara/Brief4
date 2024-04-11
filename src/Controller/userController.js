const { User } = require('../Model/User')
const client = require('../Service/DbConnection')
const { ObjectId } = require('bson')

require('dotenv').config()

const register = async (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.name) {
    res.status(400).json({ error: 'Some fields are missing' })
    return
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10)

  try {
    let user = await client
      .db('brief_4')
      .collection('user')
      .findOne({ mail: req.body.mail })

    if (user) {
      if (req.body.mail == user.mail) {
        res.status(400).json({ error: 'mail already used', status: 400 })
        return
      }
    }
    let newUser = new User(
      req.body.email,
      req.body.password,
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
    res.status(200).json(result)
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
      // TODO
    }
  } catch (error) {
    res.status(500).json(error.stack)
  }
}

module.exports = { register, login }
