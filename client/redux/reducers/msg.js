const ADD_MESSAGE = 'msg/ADD_MESSAGE'
const USER_LOGIN = 'msg/USER_LOGIN'
const USER_LOGOUT = 'msg/USER_LOGOUT'
const SET_ONLINEUSERS = 'msg/SET_ONLINEUSERS'
const CLEAN_MSG_REDUCER = 'msg/CLEAN_MSG_REDUCER'

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
  switch (action.type) {
    case ADD_MESSAGE:
      return { ...state, messages: [...state.messages, action.payload] }
    case USER_LOGIN:
      return {
        ...state,
        onlineUsers: [...state.onlineUsers, action.payload]
      }
    case USER_LOGOUT:
      return {
        ...state,
        onlineUsers: state.onlineUsers.filter((it) => it !== action.payload)
      }
    case SET_ONLINEUSERS:
      return {
        ...state,
        onlineUsers: [...state.onlineUsers, ...action.payload]
      }
    case CLEAN_MSG_REDUCER:
      return initialState
    default:
      return state
  }
}

const addMessageToState = (message) => {
  return { type: ADD_MESSAGE, payload: message }
}

const userLogInAC = (username) => {
  return { type: USER_LOGIN, payload: username }
}

const userLogOutAC = (username) => {
  return { type: USER_LOGOUT, payload: username }
}

const setOnlineUsersAC = (users) => {
  return { type: SET_ONLINEUSERS, payload: users }
}

const cleanMsgReducerAC = () => {
  return { type: CLEAN_MSG_REDUCER }
}

export const sendMessage = (data) => (dispatch, getState) => {
  if (data.message) dispatch(addMessageToState(data))
  const { socket } = getState().socket
  isSocketReady(socket, () => socket.send(JSON.stringify(data)))
}

export const userLogIn = (username) => (dispatch) => {
  dispatch(userLogInAC(username))
}

export const userLogOut = (username) => (dispatch) => {
  dispatch(userLogOutAC(username))
}

export const setOnlineUsers = (onlineUsers, localUsername) => async (dispatch) => {
  const onlineUsersDeduplicated = onlineUsers.filter(
    (it, index) => onlineUsers.indexOf(it) === index
  )
  const onlineUsersToSet = onlineUsersDeduplicated.filter((it) => it !== localUsername)
  dispatch(setOnlineUsersAC(onlineUsersToSet))
}

export const cleanMsgReducer = () => (dispatch) => {
  dispatch(cleanMsgReducerAC())
}

export const newMessageReceived = (message, localUsername) => (dispatch) => {
  const { messageID, timestamp, username } = message
  const logInMessage = {
    type: 'SHOW_MESSAGE',
    channel: 'ALL',
    messageID,
    timestamp,
    username: 'ChatInfo',
    message: `${username} logged in`
  }
  const logOutMessage = {
    type: 'SHOW_MESSAGE',
    channel: 'ALL',
    messageID,
    timestamp,
    username: 'ChatInfo',
    message: `${username} logged out`
  }

  if (message.type === 'USER_LOGIN') {
    if (localUsername !== message.username) dispatch(userLogIn(message.username))
    dispatch(addMessageToState(logInMessage))
  } else if (message.type === 'USER_LOGOUT') {
    dispatch(userLogOut(message.username))
    dispatch(addMessageToState(logOutMessage))
  } else if (message.type === 'SHOW_MESSAGE') {
    dispatch(addMessageToState(message))
  } else if (message.type === 'ONLINEUSERS') {
    dispatch(setOnlineUsers(message.onlineUsers, localUsername))
  }
}
