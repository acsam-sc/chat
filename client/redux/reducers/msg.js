import { socket } from '../index'

const sendMessage = (data) => {
  socket.send(JSON.stringify(data))
}

// const initialState = {
//   username: '',
//   message: ''
// }

// export default (state = initialState, action) => {
//   switch (action.type) {
//     case UPDATE_MESSAGE_TO_SEND:
//       return { ...state, username: action.payload }
//     default:
//       return state
//   }
// }

export default sendMessage
