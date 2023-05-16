import React from 'react'
import { useSelector } from 'react-redux'
import Message from './message'
import MessageInput from './message-input'

const ChatMessages = () => {
  const messages = useSelector((state) => state.msg.messages)
  const onlineUsers = useSelector((state) => state.msg.onlineUsers)
  const reversedMessages = [...messages].reverse()

  return (
    // <div className="px-6 py-4 flex-1 flex-col justify-between overflow-scroll-x">
    <div className="px-6 py-4 flex flex-col flex-1 justify-end">
      <div className="flex flex-col-reverse">
        {reversedMessages.map((it, index) => {
          // const chatInfoPic = new Image(100, 100)
          const chatInfoPic = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E`
          const userpic = () => (it.username === 'ChatInfo')
            ? chatInfoPic
            : onlineUsers.find((user) => user.username === it.username).userpic
          return (
            <Message
              key={index}
              channel={it.channel}
              messageId={it.messageId}
              timestamp={it.timestamp}
              username={it.username}
              userpic={userpic()}
              text={it.message}
            />
          )
        })}
      </div>
      <MessageInput latestIndex={messages.length} />
    </div>
  )
}

export default ChatMessages
