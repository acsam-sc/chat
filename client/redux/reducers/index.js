import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import auth from './auth'
import msg from './msg'
import socket from './socket'

const createRootReducer = (history) =>
  combineReducers({
    router: connectRouter(history),
    auth,
    msg,
    socket
  })

export default createRootReducer
