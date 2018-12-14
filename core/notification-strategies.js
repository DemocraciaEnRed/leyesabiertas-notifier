const agenda = require('../api/jobs/agenda')
const { NODE_ENV } = process.env

const basePath = NODE_ENV === 'production' ? '../dist/templates' : '../templates'

const execute = (to, subject, template) => {
  const emailOptions = {
    to,
    subject,
    template
  }
  agenda.now('send-email', emailOptions)
}

const buildTemplate = (fileName, props) => {
  const path = `${basePath}/${fileName}`
  const reactTemplate = require(path)

  return reactTemplate({ ...props })
}

const commentResolved = (info) => {
  const template = buildTemplate('comment-resolved', info)
  execute(info.author.email, '¡Comentario resuelto!', template)
}

const commentLiked = (info) => {
  const template = buildTemplate('comment-liked', info)
  execute(info.author.email, '¡Comentario relevante!', template)
}

const commentContribution = (info) => {
  const template = buildTemplate('comment-contribution', info)
  execute(info.author.email, '¡Comentario marcado como aporte!', template)
}

const strategies = [
  ['comment-resolved', commentResolved],
  ['comment-liked', commentLiked],
  ['comment-contribution', commentContribution]
]

const strategiesMap = new Map(strategies)

function sendEmail (type, info) {
  if (!strategiesMap.has(type)) {
    throw new Error("The type does'n exists.")
  }

  strategiesMap.get(type)(info)
};

module.exports.sendEmail = sendEmail
