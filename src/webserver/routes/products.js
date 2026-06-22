const express = require('express')
const router = express.Router({ mergeParams: true })
const controller = require('../controllers/productsController')
const auth = require('../middleware/auth')

router.route('/')
    .get(controller.getAll)
    .post(auth, controller.create)

router.route('/:pId')
    .get(controller.getById)
    .patch(auth, controller.update)
    .delete(auth, controller.remove)

module.exports = router