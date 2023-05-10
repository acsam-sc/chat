import React from 'react'
import { useSelector } from 'react-redux'
import Message from './message'
import MessageInput from './message-input'

const ChatMessages = () => {
  const messages = useSelector((state) => state.msg.messages)
  const reversedMessages = [...messages].reverse()

  return (
    // <div className="px-6 py-4 flex-1 flex-col justify-between overflow-scroll-x">
    <div className="px-6 py-4 flex flex-col flex-1 justify-end">
      <div className="flex flex-col-reverse">
        {reversedMessages.map((it, index) => {
          return (
            <Message
              key={index}
              channel={it.channel}
              messageId={it.messageId}
              timestamp={it.timestamp}
              username={it.username}
              userpic="https://i.imgur.com/8Km9tLL.jpg"
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
