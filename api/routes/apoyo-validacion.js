const express = require('express')
const router = express.Router()
const ApoyoValidacion = require('../controllers/apoyo-validacion')

router.post('/', ApoyoValidacion.post)

module.exports = router
