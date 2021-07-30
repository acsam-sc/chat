import React from 'react'
import Message from './message'
import MessageInput from './message-input'

const ChatMessages = () => {
  return (
    // <div className="px-6 py-4 flex-1 flex-col justify-between overflow-scroll-x">
    <div className="px-6 py-4 flex flex-col flex-1 justify-end">
      <div className="flex flex-col-reverse">
        <Message
          messageId="111"
          timestamp="12:45"
          username="Olivia_Dunham"
          userpic="https://i.imgur.com/8Km9tLL.jpg"
          text="How are we supposed to control the marquee space without an utility for it? I propose"
        />
        <Message
          messageId="222"
          timestamp="12:47"
          username="Olivia_Dunham"
          userpic="https://i.imgur.com/8Km9tLL.jpg"
          text="How are we supposed to control the marquee space without an utility for it? I propose"
        />
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatMessages
