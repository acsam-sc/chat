import React from 'react'

const Message = (props) => {
  const timestamp = new Date(props.timestamp)
  return (
    <div className="flex items-start mb-4">
      <img alt="message_img" src={props.userpic} className="w-10 h-10 rounded mr-3" />
      <div className="flex flex-col">
        <div className="flex items-end">
          <span className="font-bold text-md mr-2 font-sans">
            {props.username}
            {props.messageId}
          </span>
          <span className="text-gray-500 text-xs font-light">{`${timestamp.getUTCHours()}:${timestamp.getUTCMinutes()}:${timestamp.getUTCSeconds()}`}</span>
        </div>
        <p className="font-light text-md text-gray-700 pt-1"> {props.text} </p>
      </div>
    </div>
  )
}

export default Message
