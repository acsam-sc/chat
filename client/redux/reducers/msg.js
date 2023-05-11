const ADD_MESSAGE = 'msg/ADD_MESSAGE'
const USER_LOGIN = 'msg/USER_LOGIN'
const USER_LOGOUT = 'msg/USER_LOGOUT'

const initialState = {
  messages: [],
  onlineUsers: []
}

const isSocketReady = (socket, callback) => {
  setTimeout(() => {
    if (socket.readyState === 1) {
      if (callback !== null) {
        callback()
      }
    } else {
      isSocketReady(socket, callback)
    }
  }, 500)
}

export default (state = initialState, action) => {
  // console.log('MSG REDUCER', action)
  switch (action.type) {
    case ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] }
    case USER_LOGIN:
      return { ...state, onlineUsers: [...state.onlineUsers, action.payload.username] }
    case USER_LOGOUT:
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter((it) => it !== action.payload.username)
      }
    default:
      return state
  }
}

const addMessage = (message) => {
  return { type: ADD_MESSAGE, payload: message }
}

const userLogInAC = (message) => {
  return { type: USER_LOGIN, payload: message }
}

const userLogOutAC = (message) => {
  return { type: USER_LOGOUT, payload: message }
}

export const sendMessage = (data) => (dispatch, getState) => {
  if (data.message) dispatch(addMessage(data))
  const { socket } = getState().socket
  isSocketReady(socket, () => socket.send(JSON.stringify(data)))
}

export const userLogIn = (message) => (dispatch, getState) => {
  console.log('userLogIn', message)
  if (getState().msg.onlineUsers.findIndex((it) => it === message.username) < 0)
    dispatch(userLogInAC(message))
}

export const userLogOut = (message) => (dispatch) => {
  dispatch(userLogInAC(message))
}

export const newMessage = (message) => (dispatch) => {
  if (message.type === 'USER_LOGIN') {
    dispatch(userLogInAC(message))
    dispatch(
      addMessage({
        type: 'SHOW_MESSAGE',
        channel: 'ALL',
        messageID: message.messageID,
        timestamp: message.timestamp,
        username: 'ChatInfo',
        message: `${message.username} just logged in`
      })
    )
  } else if (message.type === 'USER_LOGOUT') {
    dispatch(userLogOutAC(message))
    dispatch(
      addMessage({
        type: 'SHOW_MESSAGE',
        channel: 'ALL',
        messageID: message.messageID,
        timestamp: message.timestamp,
        username: 'ChatInfo',
        message: `${message.username} just logged out`
      })
    )
  } else if (message.type === 'SHOW_MESSAGE') {
    dispatch(addMessage(message))
  }
}
