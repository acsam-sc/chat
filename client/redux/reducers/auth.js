import Cookies from 'universal-cookie'
import { sendRegData, getAuth, sendAuthData, getOnlineUsers } from '../../api/auth'
import { history } from '..'
import { sendMessage, userLogIn } from './msg'

const SET_AUTH_ERROR = 'auth/SET_AUTH_ERROR'
const SET_REG_ERROR = 'auth/SET_REG_ERROR'
const SET_USERNAME = 'auth/SET_USERNAME'
const SET_TOKEN = 'auth/SET_TOKEN'

const cookies = new Cookies()

const initialState = {
  username: '',
  password: '',
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
        username: action.payload.username,
        password: ''
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
    await sendRegData(formData).then((res) => {
      console.log('registerUser', JSON.stringify(res))
      if (res.data.status === 'error') {
        dispatch(setRegError(res.data.error))
      } else {
        dispatch(setUsername(res.data.user.username))
        dispatch(setToken(res.data.token))
        history.push('/chat')
      }
    })
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
    ).then((res) => {
      if (res.data.status === 'error') {
        dispatch(setAuthError(res.data.error))
      } else {
        dispatch(setUsername(res.data.user.username))
        dispatch(setToken(res.data.token))
        dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username }))
        history.push('/chat')
      }
    })
}

export const trySignIn = () => async (dispatch) => {
  // console.log('Trying SignIn')
  await getAuth()
    .then((res) => {
      dispatch(setUsername(res.data.user.username))
      dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username: res.data.user.username }))
      history.push('/chat')
    })
    .catch(() => history.push('/login'))
}

// export const tryGetUserInfo = () => async (dispatch) => {
//   await axios.get('/api/v1/onlineusers').then((res) => {
//   console.log('tryGetUserInfo', res.data.onlineUsers)
//     res.data.onlineUsers.map((it) => {
//       dispatch(userLogIn({ username: it.username }))
//       return it
//     })
//   })
// }

export const tryGetUserInfo = () => async (dispatch) => {
  await getOnlineUsers().then((res) => {
    // console.log('GettingOnlineUsers', res.data.onlineUsers)
    res.data.onlineUsers.map((it) => {
      dispatch(userLogIn({ username: it.username }))
      return it
    })
  })
}
