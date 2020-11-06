const React = require('react')
const { Email, Item, Span, A, renderEmail, Box, Image } = require('react-html-email')
const MailHeader = require('./header')
const MailFooter = require('./footer')
const Content = require('./content')
const Style = require('./styles')
const CommentContainerStyle = require('./commentContainerStyle')
const { ORGANIZATION_NAME, ORGANIZATION_URL, ORGANIZATION_API_URL } = process.env

const ApoyoValidacion = (props) => {
  const { documentTitle, token } = props
  const validationUrl = `${ORGANIZATION_URL}/validar-apoyo?v=${token.token}`
  return (
    <Email title='Validación de apoyo' style={{ width: '100%', maxWidth: '700px' }}>
      <MailHeader />
      <Content name={token.nombreApellido} showName={true} style={{ width: '100%' }}>

        <Item style={Style.itemStyle}>
          <Span {...Style.defaultContentStyle}>
            Has apoyado el proyecto <b>{documentTitle}</b>.
          </Span>
        </Item>
        <Item style={Style.itemStyle}>
          <Span {...Style.defaultContentStyle}>
            Por favor, ingrese en <A href={validationUrl}>este link</A> para validar su apoyo.
          </Span>
        </Item>

      </Content>
      <MailFooter />
    </Email>
  )
}

module.exports = (props) => renderEmail(<ApoyoValidacion {...props} />)
