const express = require('express')
const cors = require('cors')

const { connect } = require('./Service/DbConnection')
const userRoute = require('./Controller/Routes/......')
const listingRoute = require('./Controller/Routes/.........')
require('dotenv').config()

const app = express()

app.use(express.json())
app.use(cors())

connect(process.env.DB_URL, (error) => {
  if (error) {
    console.log('Failed to connect')
    process.exit(-1)
  } else {
    console.log('successfully connected')
  }
})

app.use('/users', userRoute)
app.use('/events', listingRoute)

app.listen(3232)
