const ADD_SOCKET = 'socket/ADD_SOCKET'
// const SOCKET_CONNECTED = 'socket/SOCKET_CONNECTED'
// const MESSAGE_RECEIVED = 'socket/MESSAGE_RECEIVED'
// const SHOW_MESSAGE = 'socket/SHOW_MESSAGE'
// const SOCKET_DISCONNECTED = 'socket/SOCKET_DISCONNECTED'

const initialState = {
  // socket: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_SOCKET:
      return { ...state, socket: action.payload }
    default:
      return state
  }
}

const addSocket = (socket) => {
  return { type: ADD_SOCKET, payload: socket }
}

export const addSocketToState = (socket) => (dispatch) => {
  dispatch(addSocket(socket))
}
