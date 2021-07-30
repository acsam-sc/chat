import React, {useState} from 'react'

const MessageInput = () => {
  const [messageText, setMessageText] = useState('')
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      console.log('Message to send:', messageText)
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
        onKeyPress={(e) => handleKeyPress(e)}
      />
    </div>
  )
}

export default MessageInput
