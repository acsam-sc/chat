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
  }, 1000)
}

export default (state = initialState, action) => {
  // console.log('MSG REDUCER', action)
  switch (action.type) {
    case ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] }
    case USER_LOGIN:
      return {
        ...state,
        onlineUsers: [
          ...state.onlineUsers,
          { username: action.payload.username, userpic: action.payload.userpic }
        ]
      }
    case USER_LOGOUT:
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter((it) => it.username !== action.payload.username)
      }
    default:
      return state
  }
}

const addMessageToState = (message) => {
  return { type: ADD_MESSAGE, payload: message }
}

const userLogInAC = (message) => {
  return { type: USER_LOGIN, payload: message }
}

const userLogOutAC = (message) => {
  return { type: USER_LOGOUT, payload: message }
}

export const sendMessage = (data) => (dispatch, getState) => {
  if (data.message) dispatch(addMessageToState(data))
  const { socket } = getState().socket
  isSocketReady(socket, () => socket.send(JSON.stringify(data)))
}

export const userLogIn = (message) => (dispatch) => {
  dispatch(userLogInAC(message))
}

export const userLogOut = (message) => (dispatch) => {
  dispatch(userLogOutAC(message))
}

export const newMessageReceived = (message, onlineUsers) => (dispatch) => {
  const logInMessage = {
    type: 'SHOW_MESSAGE',
    channel: 'ALL',
    messageID: message.messageID,
    timestamp: message.timestamp,
    username: 'ChatInfo',
    message: `${message.username} just logged in`
  }
  const logOutMessage = {
    type: 'SHOW_MESSAGE',
    channel: 'ALL',
    messageID: message.messageID,
    timestamp: message.timestamp,
    username: 'ChatInfo',
    message: `${message.username} just logged out`
  }

  if (message.type === 'USER_LOGIN') {
    // const userpicToString = `data:${message.userpic.contentType};base64, ${Buffer.from(
    //   message.userpic.data.data
    // ).toString('base64')}`
    // dispatch(userLogIn({ username: message.username, userpic: userpicToString }))
    if (onlineUsers.findIndex((it) => it === message.username) < 0) {
      dispatch(userLogIn(message))
      dispatch(addMessageToState(logInMessage))
      // dispatch(sendMessage(logInMessage, socket))
    }
  } else if (message.type === 'USER_LOGOUT') {
    dispatch(userLogOut(message))
    dispatch(addMessageToState(logOutMessage))
    // dispatch(sendMessage(logOutMessage, socket))
  } else if (message.type === 'SHOW_MESSAGE') {
    dispatch(addMessageToState(message))
  }
}
