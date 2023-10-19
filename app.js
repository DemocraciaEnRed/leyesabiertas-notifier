require('dotenv').config()

const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const sendEmailRoutes = require('./api/routes/send-email')
const setCloseEvent = require('./api/routes/document-closes')
const setNewCommentEvent = require('./api/routes/comment-new')
const documentPopularRoutes = require('./api/routes/document-popular')
const documentPublishedRoutes = require('./api/routes/document-published')
const apoyoValidacionRoutes = require('./api/routes/apoyo-validacion')

const { NODE_ENV } = process.env

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-Width, Content-Type, Accept, Authorization'
  )
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET')
    return res.status(200).json({})
  }
  next()
})

app.use('/api/send-email', sendEmailRoutes)
app.use('/api/set-document-closes', setCloseEvent)
app.use('/api/comment-new', setNewCommentEvent)
app.use('/api/document-popular', documentPopularRoutes)
app.use('/api/document-published', documentPublishedRoutes)
app.use('/api/apoyo-validacion', apoyoValidacionRoutes)

if (NODE_ENV === 'development') app.use('/dev', require('./api/routes/dev-view'))

app.use((req, res, next) => {
  const error = new Error('Not found')
  error.status = 404
  next(error)
})

app.use((error, req, res) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app
