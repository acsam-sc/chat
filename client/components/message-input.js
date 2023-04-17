import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import sendMessage from '../redux/reducers/msg'

const MessageInput = () => {
  const { username } = useSelector((state) => state.auth)
  const [messageText, setMessageText] = useState('')
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage({
        username,
        message: messageText
      })
      setMessageText('')
    }
  }

  return (
    <div className="flex m-6 rounded-lg border-2 border-gray-500 overflow-hidden">
      <span className="text-3xl text-gray px-3 border-r-2 border-gray-500">+</span>
      <input
        type="text"
        className="w-full px-4"
        value={messageText}
        placeholder="Message to #general"
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => handleKeyPress(e)}
      />
    </div>
  )
}

export default MessageInput
