const express = require('express')
const router = express.Router()
const DocumentPopular = require('../controllers/document-popular')

router.post('/', DocumentPopular.post)

module.exports = router
