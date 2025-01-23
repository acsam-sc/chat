import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import SockJS from 'sockjs-client'

import rootReducer from './reducers'
import createHistory from './history'
import { addSocketToState, removeSocketFromState } from './reducers/socket'
import { newMessageReceived, sendMessage } from './reducers/msg'

export const history = createHistory()

const isBrowser = typeof window !== 'undefined'

const initialState = {}
const enhancers = []
const middleware = [thunk, routerMiddleware(history)]

const composeFunc = process.env.NODE_ENV === 'development' ? composeWithDevTools : compose

const composedEnhancers = composeFunc(applyMiddleware(...middleware), ...enhancers)

const store = createStore(rootReducer(history), initialState, composedEnhancers)

if (typeof ENABLE_SOCKETS !== 'undefined' && ENABLE_SOCKETS) {
  const initSocket = () => {
    const { username, token } = store.getState().auth
    const socket = new SockJS(`${isBrowser ? window.location.origin : 'http://localhost'}/ws`)
    store.dispatch(addSocketToState(socket))
    if (username && token) store.dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username }))

    socket.onopen = () => {
      // store.dispatch(addSocketToState(socket))
    }

    socket.onmessage = (message) => {
      const parsedData = JSON.parse(message.data)
      const localUsername = store.getState().auth.username
      store.dispatch(newMessageReceived(parsedData, localUsername))
    }

    socket.onclose = () => {
      store.dispatch(removeSocketFromState())
      setTimeout(() => {
        initSocket()
      }, 2000)
    }
  }

  initSocket()
}

export default store
