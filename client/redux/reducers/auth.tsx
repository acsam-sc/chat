import axios from 'axios'
import Cookies from 'universal-cookie'
import { history } from '..'

const UPDATE_USERNAME = 'auth/UPDATE_USERNAME'
const UPDATE_PASSWORD = 'auth/UPDATE_PASSWORD'
const SET_AUTH_ERROR = 'auth/SET_AUTH_ERROR'
const SET_REG_ERROR = 'auth/SET_REG_ERROR'
const REGISTER_USER = 'auth/REGISTER_USER'
const LOGIN = 'auth/LOGIN'

const cookies = new Cookies()

type UserType = {
  roles: Array<string>,
  createdAt: Date,
  _id: string,
  username: string,
  password: string
}

const initialState = {
  username: '' as string,
  password: '' as string,
  regError: null as null | string,
  authError: null as null | string,
  token: cookies.get('token'),
  user: {} as UserType
}

type InitialState = typeof initialState

export default (state = initialState, action: any): InitialState => {
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

type UpdateUsernameFieldActionType = {
  type: typeof UPDATE_USERNAME,
  payload: string
}
export const updateUsernameField = (username: string): UpdateUsernameFieldActionType => {
  return { type: UPDATE_USERNAME, payload: username }
}

type UpdatePasswordFieldActionType = {
  type: typeof UPDATE_PASSWORD,
  payload: string
}
export const updatePasswordField = (password: string): UpdatePasswordFieldActionType => {
  return { type: UPDATE_PASSWORD, payload: password }
}

type SetAuthErrorActionType = {
  type: typeof SET_AUTH_ERROR,
  payload: null | string
}
export const setAuthError = (authError: null | string): SetAuthErrorActionType => {
  return { type: SET_AUTH_ERROR, payload: authError }
}

type SetRegErrorActionType = {
  type: typeof SET_REG_ERROR,
  payload: null | string
}
export const setRegError = (regError: null | string): SetRegErrorActionType => {
  return { type: SET_REG_ERROR, payload: regError }
}

export const registerUser = (username: string, password: string, repeatPassword: string) => async (dispatch: any) => {
  dispatch(setRegError(null))
  if (!username) {
    dispatch(setRegError('Username cannot be empty'))
  } else if (!password) {
    dispatch(setRegError('Password cannot be empty'))
  } else if (password !== repeatPassword) {
    dispatch(setRegError('Passwords do not match'))
  } else
    axios
      .post('/api/v1/reg', {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      })
      .then((res: any) => {
        if (res.data.status === "error") {
          dispatch(setRegError(res.data.error))
        }
        else {
          dispatch({ type: REGISTER_USER, token: res.data.token, user: res.data.user })
          history.push('/login')
        }
      })
}

export const signInUser = () => async (dispatch: any, getState: any) => {
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
      .then((res: any) => {
        if (res.data.status === "error") {
          dispatch(setAuthError(res.data.error))
        }
        else {
          dispatch({ type: LOGIN, token: res.data.token, user: res.data.user })
          history.push('/chat')
        }
      })
}

export const trySignIn = () => async (dispatch: any) => {
  axios
    .get('/api/v1/auth')
    .then((res) => {
    dispatch({ type: LOGIN, token: res.data.token, user: res.data.user })
    history.push('/chat')
  })
    .catch((err) => history.push('/login'))
}

export const tryGetUserInfo = () => async () => {
  axios.get('/api/v1/user-info').then((res) => {
    console.log('tryGetUserInfo', res.data)
  })
}
