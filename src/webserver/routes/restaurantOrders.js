const express = require('express')
const router = express.Router({ mergeParams: true })
const controller = require('../controllers/ordersController')

router.get('/', controller.getByRestaurant)

module.exports = router
