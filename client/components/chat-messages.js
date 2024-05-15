import React from 'react'
import Message from './message'

const ChatMessages = (props) => {
  const timestamp = Date.now()
  return (
    <div className="px-6 py-4 flex flex-col-reverse flex-grow overflow-y-auto">
      {props.reversedMessages.map((it) => {
        const chatInfoPic = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E`
        const userpic = () =>
          it.username === 'ChatInfo' ? chatInfoPic : `/images/userpics/${it.username}.jpg`
        return (
          <Message
            key={timestamp + it.messageID}
            channel={it.channel}
            messageID={it.messageID}
            timestamp={it.timestamp}
            username={it.username}
            userpic={userpic()}
            text={it.message}
          />
        )
      })}
    </div>
  )
}

export default ChatMessages
