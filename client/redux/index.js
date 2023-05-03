import { createStore, applyMiddleware, compose } from 'redux'
import { routerMiddleware } from 'connected-react-router'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import SockJS from 'sockjs-client'

import rootReducer from './reducers'
import createHistory from './history'
import socketActions from './sockets'

export const history = createHistory()

const isBrowser = typeof window !== 'undefined'

const initialState = {}
const enhancers = []
const middleware = [thunk, routerMiddleware(history)]

const composeFunc = process.env.NODE_ENV === 'development' ? composeWithDevTools : compose

const composedEnhancers = composeFunc(applyMiddleware(...middleware), ...enhancers)

const store = createStore(rootReducer(history), initialState, composedEnhancers)

// if (typeof ENABLE_SOCKETS !== 'undefined' && ENABLE_SOCKETS) {
  // const initSocket = () => {
    console.log('initSocket')
    export const socket = new SockJS(`${isBrowser ? window.location.origin : 'http://localhost'}/ws`)

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'WELCOME_MESSAGE', username: store.getState().auth.username }))
      store.dispatch(socketActions.connected)
    }

    socket.onmessage = (message) => {
      // const parsedData = JSON.parse(data)
      // store.dispatch(socketActions.message)
      // socket.send(message)
      // eslint-disable-next-line no-console
      console.log('socket.onmessage', JSON.parse(message.data))
      // socket.close();
    }

    socket.onclose = () => {
      store.dispatch(socketActions.disconnected)
      setTimeout(() => {
        // initSocket()
      }, 2000)
    }
  // }

  // initSocket()
// }


export default store
