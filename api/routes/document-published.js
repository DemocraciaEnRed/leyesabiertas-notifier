const express = require('express')
const router = express.Router()
const DocumentPublished = require('../controllers/document-published')

router.post('/', DocumentPublished.post)

module.exports = router
