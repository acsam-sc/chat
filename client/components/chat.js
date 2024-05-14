import React from 'react'
import { useSelector } from 'react-redux'
import TopBar from './top-bar'
import ChatMessages from './chat-messages'
import MessageInput from './message-input'

const Chat = () => {
  const messages = useSelector((state) => state.msg.messages)
  const reversedMessages = [...messages].reverse()

  return (
    // <div className="w-full h-full flex flex-col">
    <div className="w-full flex flex-col flex-grow">
      <TopBar />
      <ChatMessages reversedMessages={reversedMessages} />
      <MessageInput latestIndex={messages.length} />
    </div>
  )
}

export default Chat
