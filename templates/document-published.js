const React = require('react')
const { Email, Item, Span, A, renderEmail, Box, Image } = require('react-html-email')
const MailHeader = require('./header')
const MailFooter = require('./footer')
const Content = require('./content')
const Style = require('./styles')
// const CommentContainerStyle = require('./commentContainerStyle')
const { ORGANIZATION_NAME, ORGANIZATION_URL, ORGANIZATION_API_URL } = process.env

const cardStyle = {
  width: '80%',
  margin: '30px auto',
  border: 'solid 1px #e9e9e9',
  position: 'relative'
}

const noImageStyle = {
  width: '100%',
  height: '126px',
  backgroundColor: '#1b95ba',
  overflow: 'hidden'
}

const cardLabelStyle = {
  width: '80%',
  backgroundColor: '#ffffff',
  position: 'relative',
  marginTop: '-63px',
  padding: '10px 10px 20px'
}
const userContainerStyle = {
  padding: '30px 0 10px'
}

const userAvatarStyle = {
  position: 'relative',
  height: '40px',
  width: '40px',
  display: 'inline-block',
  marginRight: '10px',
  verticalAlign: 'middle',
  borderRadius: '400px'
}

const userNameStyle = {
  color: '#404b68',
  fontSize: 14,
  fontWeight: 'bold'
}
function getImageStyle (imgUrl) {
  return {
    width: '100%',
    height: '126px',
    backgroundColor: '#1b95ba',
    backgroundImage: `url(${imgUrl})`,
    overflow: 'hidden',
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  }
}

const titleStyle = { fontSize: 24, fontWeight: 'bold', lineHeight: 'normal' }

const DocumentPublished = (props) => {
  return (
    <Email title='¡Nuevo proyecto publicado en Leyes Abiertas!' style={{ width: '100%', maxWidth: '700px' }}>
      <MailHeader />
      <Content name={props.user.name} style={{ width: '100%' }}>

        <Item style={Style.itemStyle}>
          <Span {...Style.defaultContentStyle}>
            Te informamos que se ha publicado un nuevo proyecto de <b>{props.document.author}</b>: <b>{props.document.title}</b> en el <A href={`${ORGANIZATION_URL}/propuesta?id=${props.document.id}`}>{ORGANIZATION_NAME}</A>.
          </Span>
        </Item>

        <Item style={Style.itemStyle}>
          <A href={`${ORGANIZATION_URL}/propuesta?id=${props.document.id}`} textDecoration='none'>
            <Box align='center' style={cardStyle}>
              <Item>
                {
                  props.document.imageCover
                    ? <Box style={getImageStyle(props.document.imageCover)} />
                    : <Box style={noImageStyle} />
                }
                <Box style={cardLabelStyle}>
                  <Item>
                    <Span style={titleStyle}>{props.document.title}</Span>
                  </Item>
                  <Item style={userContainerStyle}>
                    <Span style={userNameStyle}>
                      <Image src={`${ORGANIZATION_API_URL}/api/v1/users/${props.author.id}/avatar`} style={userAvatarStyle} />
                      {props.author.fullname}
                    </Span>
                  </Item>
                </Box>
              </Item>
            </Box>
          </A>
        </Item>

        <Item style={Style.itemStyle}>
          <em>
            <Span {...Style.smallContentStyle}>
            Usted está recibiendo esta notificación ya que su perfil está configurado para recibir un correo cada vez que se publica un proyecto con etiquetas de su interés o por estar suscripto al diputado autor del proyecto. Para desactivar este tipo de notificaciones o cambiar sus etiquetas de interés, ingrese a <A href={`${ORGANIZATION_URL}/userprofile`}>su perfil</A>.
            </Span>
          </em>
        </Item>

      </Content>
      <MailFooter />
    </Email>
  )
}

module.exports = (props) => renderEmail(<DocumentPublished {...props} />)
