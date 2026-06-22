const express = require('express')
const router = express.Router()
const controller = require('../controllers/ordersController')

router.route('/')
    .get(controller.getByUser)
    .post(controller.create)

router.route('/:id')
    .get(controller.getById)
    .patch(controller.update)
    .delete(controller.remove)

module.exports = router