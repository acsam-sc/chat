import React, { useState } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { signInUser, setAuthError } from '../redux/reducers/auth'

const LoginPage = () => {
  const dispatch = useDispatch()
  const { authError } = useSelector((state) => state.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const isSignInButtonDisabled = !username || !password || authError
  const handleOnKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (!isSignInButtonDisabled) dispatch(signInUser(username, password))
    }
  }

  return (
    <div className="w-screen h-screen bg-gray-100 flex justify-center items-center">
      <div className=" max-w-xs ">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className={classNames(
                authError
                  ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-red-500'
                  : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              )}
              id="username"
              type="text"
              value={username}
              placeholder="Username"
              onChange={(e) => {
                setUsername(e.target.value)
                dispatch(setAuthError(''))
              }}
              onKeyPress={(e) => handleOnKeyPress(e)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className={classNames(
                authError
                  ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-red-500'
                  : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              )}
              id="password"
              type="password"
              value={password}
              placeholder="******************"
              onChange={(e) => {
                setPassword(e.target.value)
                dispatch(setAuthError(''))
              }}
              onKeyPress={(e) => handleOnKeyPress(e)}
            />
            {authError && <p className="text-red-500 text-xs italic">{authError}</p>}
          </div>
          <div className="flex items-center justify-around">
            <button
              disabled={isSignInButtonDisabled}
              className={classNames(
                isSignInButtonDisabled
                  ? 'bg-gray-400 text-white font-bold py-2 px-4 rounded'
                  : 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              )}
              type="button"
              onClick={() => dispatch(signInUser(username, password))}
            >
              Sign In
            </button>
            <Link
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
              to="/registration"
            >
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
