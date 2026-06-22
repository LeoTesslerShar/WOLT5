const express = require('express')
const router = express.Router()
const controller = require('../controllers/restaurantsController')
const auth = require('../middleware/auth')

router.route('/')
    .get(controller.getAll)
    .post(auth, controller.create)

router.route('/:id')
    .get(controller.getById)
    .patch(auth, controller.update)
    .delete(auth, controller.remove)

module.exports = router