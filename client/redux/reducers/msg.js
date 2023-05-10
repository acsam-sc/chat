const ADD_MESSAGE = 'msg/ADD_MESSAGE'

const initialState = {
  messages: []
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
  switch (action.type) {
    case ADD_MESSAGE:
      // console.log('ADD_MESSAGE', { ...state, messages: [ ...state.messages, action.payload ] })
      return { ...state, messages: [...state.messages, action.payload] }
    default:
      return state
  }
}

export const addMessage = (message) => {
  return { type: ADD_MESSAGE, payload: message }
}

export const sendMessage = (data) => (dispatch, getState) => {
  if (data.message) dispatch(addMessage(data))
  const { socket } = getState().socket
  isSocketReady(socket, () => socket.send(JSON.stringify(data)))
}
