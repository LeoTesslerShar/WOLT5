const express = require('express')
const router = express.Router()
const controller = require('../controllers/tokensController')

router.route('/')
        .post(controller.login)

module.exports = router
