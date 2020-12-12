import axios from 'axios'
import Cookies from 'universal-cookie'
import { history } from '..'

const UPDATE_USERNAME = 'auth/UPDATE_USERNAME'
const UPDATE_PASSWORD = 'auth/UPDATE_PASSWORD'
const SET_AUTH_ERROR = 'auth/SET_AUTH_ERROR'
const SET_REG_ERROR = 'auth/SET_AUTH_ERROR'
const REGISTER_USER = 'auth/REGISTER_USER'
const LOGIN = 'auth/LOGIN'

const cookies = new Cookies()

const initialState = {
  username: '',
  password: '',
  regError: null,
  authError: null,
  token: cookies.get('token'),
  user: {}
}

export default (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_USERNAME:
      return { ...state, username: action.payload }
    case UPDATE_PASSWORD:
      return { ...state, password: action.payload }
    case SET_REG_ERROR:
      return { ...state, regError: action.payload }
    case SET_AUTH_ERROR:
      return { ...state, authError: action.payload }
    case REGISTER_USER:
      return { ...state, password: '', user: action.user }
    case LOGIN:
      return { ...state, token: action.token, password: '', user: action.user }
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

export const setAuthError = (authError) => {
  return { type: SET_AUTH_ERROR, payload: authError }
}

export const setRegError = (regError) => {
  return { type: SET_REG_ERROR, payload: regError }
}

export const registerUser = (username, password, repeatPassword) => async (dispatch) => {
  dispatch(setAuthError(null))
  if (!username) {
    dispatch(setAuthError('Username cannot be empty'))
  } else if (!password) {
    dispatch(setAuthError('Password cannot be empty'))
  } else if (password !== repeatPassword) {
    dispatch(setAuthError('Passwords do not match'))
  } else
    axios
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
        dispatch({ type: REGISTER_USER, token: res.data.token, user: res.data.user })
        history.push('/login')
      })
}

export const signInUser = () => async (dispatch, getState) => {
  const { username, password } = getState().auth
  dispatch(setAuthError(null))
  if (!username) {
    dispatch(setAuthError('Username cannot be empty'))
  } else if (!password) {
    dispatch(setAuthError('Password cannot be empty'))
  } else
    axios
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
        dispatch({ type: LOGIN, token: res.data.token, user: res.data.user })
        history.push('/chat')
      })
}

export const trySignIn = () => (dispatch) => {
  axios.get('/api/v1/auth').then((res) => {
    dispatch({ type: LOGIN, token: res.data.token, user: res.data.user })
    history.push('/chat')
  })
}

export const tryGetUserInfo = () => () => {
  axios.get('/api/v1/user-info').then((res) => {
    console.log('tryGetUserInfo', res.data)
  })
}
