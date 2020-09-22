const React = require('react')
const { Email, Item, Span, A, renderEmail, Box, Image } = require('react-html-email')
const MailHeader = require('./header')
const MailFooter = require('./footer')
const Content = require('./content')
const Style = require('./styles')
const CommentContainerStyle = require('./commentContainerStyle')
const { ORGANIZATION_NAME, ORGANIZATION_URL, ORGANIZATION_API_URL } = process.env

const DocumentPublished = (props) => {
  return (
    <Email title='Proyecto publicado' style={{ width: '100%', maxWidth: '700px' }}>
      <MailHeader />
      <Content name={props.user.name} style={{ width: '100%' }}>

        <Item style={Style.itemStyle}>
          <Span {...Style.defaultContentStyle}>
            Se ha publicado el proyecto <b>{props.document.title}</b> de <b>{props.document.author}</b> en el <A href={`${ORGANIZATION_URL}/propuesta?id=${props.document.id}`}>{ORGANIZATION_NAME}</A>.
          </Span>
        </Item>

        <Item style={Style.itemStyle}>
          <Span {...Style.defaultContentStyle}>
            Usted está recibiendo esta notificación ya que el proyecto tiene las siguientes etiquetas de su interés:
            <br />
            "{props.matchingTags.join('", "')}"
          </Span>
        </Item>

        <Item style={Style.itemStyle}><br /></Item>

        <Item style={Style.itemStyle}>
          <em>
            <Span {...Style.defaultContentStyle}>
              Si desea desactivar estas notificaciones o cambiar sus etiquetas de interés puede ir a <A href={`${ORGANIZATION_URL}/userprofile`}>Editar perfil</A>.
            </Span>
          </em>
        </Item>

      </Content>
      <MailFooter />
    </Email>
  )
}

module.exports = (props) => renderEmail(<DocumentPublished {...props} />)
