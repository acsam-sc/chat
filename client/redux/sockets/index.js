export default {
  connected: (data) => ({
    type: 'SOCKET_CONNECTED',
    data
  }),
  message: (data) => ({
    type: 'MESSAGE_RECEIVED',
    data
  }),
  showMessage: (data) => ({
    type: 'SHOW_MESSAGE',
    data
  }),
  disconnected: (data) => ({
    type: 'SOCKET_DISCONNECTED',
    data
  })
}
