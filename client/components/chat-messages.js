import React from 'react'
import Message from './message'
import MessageInput from './message-input'

const ChatMessages = () => {
  return (
    // <div className="px-6 py-4 flex-1 flex-col justify-between overflow-scroll-x">
    <div className="px-6 py-4 flex flex-col flex-1 justify-end">
      <div className="flex flex-col-reverse">
        <Message number="111" />
        <Message number="222" />
      </div>
      <MessageInput />
    </div>
  )
}

export default ChatMessages
