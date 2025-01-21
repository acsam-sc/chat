import Cookies from 'universal-cookie'
import { sendRegData, getAuth, sendAuthData } from '../../api/auth'
import { history } from '..'
import { sendMessage, userLogIn, setOnlineUsers, cleanMsgReducer } from './msg'
import { removeSocketFromState } from './socket'

const SET_AUTH_ERROR = 'auth/SET_AUTH_ERROR'
const SET_REG_ERROR = 'auth/SET_REG_ERROR'
const SET_USERNAME = 'auth/SET_USERNAME'
const SET_TOKEN = 'auth/SET_TOKEN'

const cookies = new Cookies()

const initialState = {
  username: '',
  regError: null,
  authError: null,
  token: cookies.get('token')
}

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_REG_ERROR:
      return { ...state, regError: action.payload }
    case SET_AUTH_ERROR:
      return { ...state, authError: action.payload }
    case SET_USERNAME:
      return {
        ...state,
        username: action.payload.username
      }
    case SET_TOKEN:
      return {
        ...state,
        token: action.payload.token
      }
    default:
      return state
  }
}

export const setAuthError = (authError) => {
  return { type: SET_AUTH_ERROR, payload: authError }
}

export const setRegError = (regError) => {
  return { type: SET_REG_ERROR, payload: regError }
}

export const setUsername = (username) => {
  return { type: SET_USERNAME, payload: { username } }
}

export const setToken = (token) => {
  return { type: SET_TOKEN, payload: { token } }
}

export const registerUser = (username, password, repeatPassword, userpic) => async (dispatch) => {
  dispatch(setRegError(null))
  if (password !== repeatPassword) {
    dispatch(setRegError('Passwords do not match'))
  } else {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('userpic', userpic)
    await sendRegData(formData)
      .then((res) => {
        if (res.data.status === 'error') {
          dispatch(setRegError(res.data.error))
        } else {
          dispatch(setUsername(username))
          dispatch(userLogIn(username))
          dispatch(setToken(res.data.token))
          dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username }))
          dispatch(setOnlineUsers(username))
          history.push('/chat')
        }
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log('registerUser Error:', err))
  }
}

export const signInUser = (username, password) => async (dispatch) => {
  dispatch(setAuthError(null))
  if (!username) {
    dispatch(setAuthError('Username cannot be empty'))
  } else if (!password) {
    dispatch(setAuthError('Password cannot be empty'))
  } else
    await sendAuthData(
      { username, password },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
      .then(async (res) => {
        if (res.data.status === 'error') {
          dispatch(setAuthError(res.data.error))
        } else {
          dispatch(setUsername(username))
          dispatch(userLogIn(username))
          dispatch(setToken(res.data.token))
          dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username }))
          dispatch(setOnlineUsers(username))
          history.push('/chat')
        }
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log('signInUser Error:', err))
}

export const signOutUser = () => async (dispatch, getState) => {
  const { socket } = getState().socket
  dispatch(removeSocketFromState())
  dispatch(cleanMsgReducer())
  dispatch(setUsername(''))
  dispatch(setToken(''))
  socket.close()
  cookies.remove('token')
  history.push('/login')
}

export const trySignIn = () => async (dispatch) => {
  await getAuth()
    .then((res) => {
      const { username } = res.data.user
      dispatch(setUsername(username))
      dispatch(userLogIn(username))
      dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username }))
      dispatch(setOnlineUsers(username))
      history.push('/chat')
    })
    .catch(() => history.push('/login'))
}

// export const tryGetUserInfo = () => async (dispatch) => {
//   await getOnlineUsers()
//     .then((res) => {
//       // console.log('GettingOnlineUsers', res.data.onlineUsers)
//       res.data.onlineUsers.map((it) => {
//         dispatch(userLogIn(it.username))
//         return it
//       })
//     })
//     // eslint-disable-next-line no-console
//     .catch((err) => console.log('tryGetUserInfo Error:', err))
// }
