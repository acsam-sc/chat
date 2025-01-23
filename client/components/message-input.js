import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { sendMessage } from '../redux/reducers/msg'

const MessageInput = (props) => {
  const dispatch = useDispatch()
  const { username } = useSelector((state) => state.auth)
  const [messageText, setMessageText] = useState('')
  const prepareAndSendMessage = () => {
    const timestamp = Date.now()
    const messageToSend = {
      type: 'SHOW_MESSAGE',
      channel: '#general',
      messageID: timestamp + props.latestIndex,
      timestamp,
      username,
      message: messageText
    }
    dispatch(sendMessage(messageToSend))
    setMessageText('')
  }
  const handleKeyPress = (event) => {
    if (messageText && event.key === 'Enter') prepareAndSendMessage()
  }

  return (
    <div className="flex m-6 rounded-lg border-2 border-gray-500">
      <input
        type="text"
        className="w-full px-4"
        value={messageText}
        placeholder="Message to #general"
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => handleKeyPress(e)}
      />
      <span
        className="text-3xl text-gray px-3 border-l-2 border-gray-500 cursor-pointer"
        role="link"
        tabIndex="0"
        onMouseDown={() => prepareAndSendMessage()}
      >
        +
      </span>
    </div>
  )
}

export default MessageInput
