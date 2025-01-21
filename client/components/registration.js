import React, { useState } from 'react'
import classNames from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { registerUser, setRegError } from '../redux/reducers/auth'

const RegistrationPage = () => {
  const dispatch = useDispatch()
  const { regError } = useSelector((state) => state.auth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [userpicFile, setUserPicFile] = useState('')
  const isRegButtonDisabled = !username || !password || !repeatPassword || !userpicFile || regError
  const handlePicFileChange = (e) => {
    dispatch(setRegError(null))
    if (e.target.files[0] && e.target.files[0].size > 2097152) {
      dispatch(setRegError('File size is too big'))
    } else {
      setUserPicFile(e.target.files[0])
    }
  }
  const handleRegisterButtonClick = () => {
    dispatch(registerUser(username, password, repeatPassword, userpicFile))
  }
  const handleOnKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      if (!isRegButtonDisabled) handleRegisterButtonClick()
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
                regError === 'User already exists'
                  ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-red-500'
                  : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              )}
              id="username"
              type="text"
              value={username}
              placeholder="Username"
              onChange={(e) => {
                setUsername(e.target.value)
                dispatch(setRegError(null))
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
                regError === 'Passwords do not match'
                  ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-red-500'
                  : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              )}
              id="password"
              type="password"
              value={password}
              placeholder="******************"
              onChange={(e) => {
                setPassword(e.target.value)
                dispatch(setRegError(null))
              }}
              onKeyPress={(e) => handleOnKeyPress(e)}
            />
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repeat_password">
              Repeat Password
            </label>
            <input
              className={classNames(
                regError === 'Passwords do not match'
                  ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-red-500'
                  : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
              )}
              id="repeat_password"
              type="password"
              value={repeatPassword}
              placeholder="******************"
              onChange={(e) => {
                setRepeatPassword(e.target.value)
                dispatch(setRegError(null))
              }}
              onKeyPress={(e) => handleOnKeyPress(e)}
            />
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="userpic">
                Choose profile picture(png/jpeg, max. 2Mb):
              </label>
              <input
                className={classNames(
                  regError === 'File size is too big'
                    ? 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline border-red-500'
                    : 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
                )}
                id="userpic"
                type="file"
                accept="image/png, image/jpeg"
                onChange={(e) => handlePicFileChange(e)}
              />
            </div>
            {regError && <p className="text-red-500 text-xs italic">{regError}</p>}
          </div>
          <div className="flex items-center justify-around">
            <button
              disabled={isRegButtonDisabled}
              className={classNames(
                isRegButtonDisabled
                  ? 'bg-gray-400 text-white font-bold py-2 px-4 rounded'
                  : 'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'
              )}
              type="button"
              onClick={() => handleRegisterButtonClick()}
            >
              Register
            </button>
            <Link
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded focus:outline-none focus:shadow-outline"
              to="/login"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegistrationPage
