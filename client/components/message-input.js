import React from 'react'

const MessageInput = () => {
  return (
    <div className="flex m-6 rounded-lg border-2 border-gray-500 overflow-hidden">
      <span className="text-3xl text-gray px-3 border-r-2 border-gray-500">+</span>
      <input type="text" className="w-full px-4" placeholder="Message to #general" />
    </div>
  )
}

export default MessageInput
