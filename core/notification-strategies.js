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

const commentNew = (info) => {
  const template = buildTemplate('comment-new', info)
  execute(info.authorDocument, 'Ha recibido un nuevo comentario en su proyecto de Leyes Abiertas', template)
}

const commentResolved = (info) => {
  const template = buildTemplate('comment-resolved', info)
  execute(info.author.email, 'Su comentario en un proyecto de Leyes Abiertas ha sido marcado como resuelto', template)
}

const commentLiked = (info) => {
  const template = buildTemplate('comment-liked', info)
  execute(info.author.email, 'Su comentario en un proyecto de Leyes Abiertas ha sido marcado como relevante', template)
}

const commentReplied = (info) => {
  const template = buildTemplate('comment-replied', info)
  execute(info.author.email, 'Su comentario en un proyecto de Leyes Abiertas recibió una respuesta', template)
}

const commentContribution = (info) => {
  const template = buildTemplate('comment-contribution', info)
  execute(info.author.email, 'Su comentario en un proyecto de Leyes Abiertas ha sido marcado como aporte', template)
}

const documentPublished = (info) => {
  const template = buildTemplate('document-published', info)
  execute(info.user.email, 'Nuevo proyecto publicado en Leyes Abiertas', template)
}

const documentPopular = (info) => {
  const template = buildTemplate('document-popular', info)
  execute(info.user.email, 'Un proyecto en Leyes Abiertas está volviendose popular', template)
}

const apoyoValidacion = (info) => {
  const template = buildTemplate('apoyo-validacion', info)
  execute(info.user.email, '¡Último paso para apoyar el proyecto en Leyes Abiertas!', template)
}

const strategies = [
  ['comment-new', commentNew],
  ['comment-resolved', commentResolved],
  ['comment-liked', commentLiked],
  ['comment-replied', commentReplied],
  ['comment-contribution', commentContribution],
  ['document-published', documentPublished],
  ['document-popular', documentPopular],
  ['apoyo-validacion', apoyoValidacion]
]

const strategiesMap = new Map(strategies)

function sendEmail (type, info) {
  if (!strategiesMap.has(type)) {
    throw new Error("The type does'n exists.")
  }

  console.log('core/notification-strategies.js: Sending mail of type', type)
  strategiesMap.get(type)(info)
};

module.exports.sendEmail = sendEmail
