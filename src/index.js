const express = require('express')
const app = express()
const cors = require('cors')
const { connect } = require('./Service/DbConnection')
const userRoute = require('./Controller/Routes/user')
const listingRoute = require('./Controller/Routes/listing')
require('dotenv').config()

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

app.use('/user', userRoute)
app.use('/event', listingRoute)

console.log('ça marche')
app.listen(3232)
