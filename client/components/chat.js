import React from 'react'
import TopBar from './top-bar'
import ChatMessages from './chat-messages'

const Chat = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <TopBar />
      <ChatMessages />
    </div>
  )
}

export default Chat
