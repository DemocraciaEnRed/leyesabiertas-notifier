const React = require('react')
const { Email, Item, Span, A, renderEmail, Box, Image } = require('react-html-email')
const MailHeader = require('./header')
const MailFooter = require('./footer')
const Content = require('./content')
const Style = require('./styles')
const CommentContainerStyle = require('./commentContainerStyle')
const { ORGANIZATION_NAME, ORGANIZATION_URL, ORGANIZATION_API_URL } = process.env

const CommentRead = (props) => {
  return (
    <Email title='Comentario resuelto' style={{ width: '100%', maxWidth: '700px' }}>
      <MailHeader />
      <Content name={props.author.name} style={{ width: '100%' }}>
        <Item style={Style.itemStyle}>
          <Span {...Style.defaultContentStyle}>
          Hay un nuevo comentario en su proyecto <b>{props.document.title}</b> en <A href={`${ORGANIZATION_URL}/propuesta?id=${props.document.id}`}>{ORGANIZATION_NAME}</A>
          </Span>
        </Item>
        <Item style={Style.itemStyle}>
          <A href={`${ORGANIZATION_URL}/propuesta?id=${props.document.id}`} textDecoration='none'>
            <Box align='center' style={CommentContainerStyle.cardStyle}>
              <Item>
                <div style={CommentContainerStyle.leftColumn} >
                  <Image src={`${ORGANIZATION_URL}/static/assets/email/comment-icon.png`} style={CommentContainerStyle.cardIconImg} />
                </div>
                <div style={CommentContainerStyle.cardContentStyle}>
                  <div style={CommentContainerStyle.userContainerStyle}>
                    <Span {...CommentContainerStyle.userNameStyle}>
                      <Image src={`${ORGANIZATION_API_URL}/api/v1/users/${props.author.id}/avatar`} style={CommentContainerStyle.userAvatarStyle} />
                      {props.author.fullname}
                    </Span>
                  </div>
                  <div>
                    <Span {...CommentContainerStyle.theCommentStyle}>
                      {props.comment.content}
                    </Span>
                  </div>
                </div>
              </Item>
            </Box>
          </A>
        </Item>
        <Item style={Style.itemStyle}>
          <em>
            <Span {...Style.smallContentStyle}>
              Recibirá una notificación cada vez que un usuario participe en un proyecto de su autoría
            </Span>
          </em>
        </Item>
      </Content>
      <MailFooter />
    </Email>
  )
}

module.exports = (props) => renderEmail(<CommentRead {...props} />)
