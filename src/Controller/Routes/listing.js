const express = require('express')
const {
  createListing,
  editListing,
  deleteListing,
  getOneListing,
  getAllListing,
  getListingsFromUser,
} = require('../listingController')

const router = express.Router()

router.post('/add', createListing)
router.get('/get-all', getAllListing)
router.get('/get-from-user', getListingsFromUser)
router.get('/get-one', getOneListing)
router.patch('/edit/:userId/:listingId', editListing)
router.delete('/delete', deleteListing)

module.exports = router
