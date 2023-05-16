import axios from 'axios'
import Cookies from 'universal-cookie'
import { history } from '..'
import { sendMessage, userLogIn } from './msg'

const UPDATE_USERNAME = 'auth/UPDATE_USERNAME'
const UPDATE_PASSWORD = 'auth/UPDATE_PASSWORD'
const UPDATE_USERPIC = 'auth/UPDATE_USERPIC'
const SET_AUTH_ERROR = 'auth/SET_AUTH_ERROR'
const SET_REG_ERROR = 'auth/SET_REG_ERROR'
const LOGIN = 'auth/LOGIN'

const cookies = new Cookies()

const initialState = {
  username: '',
  password: '',
  regError: null,
  authError: null,
  token: cookies.get('token')
}

export default (state = initialState, action) => {
  // console.log('auth reducer state', action)
  switch (action.type) {
    case UPDATE_USERNAME:
      return { ...state, username: action.payload }
    case UPDATE_PASSWORD:
      return { ...state, password: action.payload }
    case UPDATE_USERPIC:
      return { ...state, userpic: action.payload }
    case SET_REG_ERROR:
      return { ...state, regError: action.payload }
    case SET_AUTH_ERROR:
      return { ...state, authError: action.payload }
    case LOGIN:
      return {
        ...state,
        token: action.payload.token,
        password: '',
        username: action.payload.username,
        userpic: action.payload.userpic
      }
    default:
      return state
  }
}

export const updateUsernameField = (username) => {
  return { type: UPDATE_USERNAME, payload: username }
}

export const updatePasswordField = (password) => {
  return { type: UPDATE_PASSWORD, payload: password }
}

export const updateUserpicFile = (userpic) => {
  return { type: UPDATE_USERPIC, payload: userpic }
}

export const setAuthError = (authError) => {
  return { type: SET_AUTH_ERROR, payload: authError }
}

export const setRegError = (regError) => {
  return { type: SET_REG_ERROR, payload: regError }
}

export const setLoginCredits = (token, username, userpic) => {
  return { type: LOGIN, payload: { token, username, userpic } }
}

export const registerUser = (username, password, repeatPassword, userpic) => async (dispatch) => {
  dispatch(setRegError(null))
  if (!username) {
    dispatch(setRegError('Username cannot be empty'))
  } else if (!password) {
    dispatch(setRegError('Password cannot be empty'))
  } else if (password !== repeatPassword) {
    dispatch(setRegError('Passwords do not match'))
  } else {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('password', password)
    formData.append('userpic', userpic)
    await axios.post('/api/v1/reg', formData).then((res) => {
      if (res.data.status === 'error') {
        dispatch(setRegError(res.data.error))
      } else {
        dispatch(setLoginCredits(res.data.token, res.data.user.username, res.data.user.userpic))
        history.push('/login')
      }
    })
  }
}

export const signInUser = () => async (dispatch, getState) => {
  const { username, password } = getState().auth
  dispatch(setAuthError(null))
  if (!username) {
    dispatch(setAuthError('Username cannot be empty'))
  } else if (!password) {
    dispatch(setAuthError('Password cannot be empty'))
  } else
    await axios
      .post('/api/v1/auth', {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      })
      .then((res) => {
        if (res.data.status === 'error') {
          dispatch(setAuthError(res.data.error))
        } else {
          dispatch(setLoginCredits(res.data.token, res.data.user.username, res.data.user.userpic))
          dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username }))
          history.push('/chat')
        }
      })
}

export const trySignIn = () => async (dispatch) => {
  console.log('Trying SignIn')
  await axios
    .get('/api/v1/auth')
    .then((res) => {
      dispatch(setLoginCredits(res.data.token, res.data.user.username, res.data.user.userpic))
      dispatch(sendMessage({ type: 'WELCOME_MESSAGE', username: res.data.user.username }))
      history.push('/chat')
    })
    .catch(() => history.push('/login'))
}

export const tryGetUserInfo = () => async (dispatch) => {
  await axios.get('/api/v1/user-info').then((res) => {
    console.log('tryGetUserInfo', res.data.onlineUsers)
    res.data.onlineUsers.map((it) =>
      dispatch(userLogIn({ username: it.username, userpic: it.userpic }))
    )
  })
}
