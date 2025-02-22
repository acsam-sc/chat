import React from 'react'
import { Route } from 'react-router-dom'
import Body from './body'

const App = () => {
  return (
    // <div className="w-full h-screen flex border shadow bg-white">
    <div className="w-full absolute inset-0 flex border shadow bg-white">
      <Route exact path="/chat" component={() => <Body />} />
    </div>
  )
}

export default App
