import React from 'react'
import Sidebar from './sidebar'
import Chat from './chat'

const Body = () => {
  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <Chat />
    </div>
  )
}

export default Body
