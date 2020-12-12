import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateUsernameField, updatePasswordField, signInUser } from '../redux/reducers/auth'

const RegistrationPage = () => {
  const dispatch = useDispatch()
  const { username, password, authError } = useSelector((state) => state.auth)

  return (
    <div className="w-screen h-screen bg-gray-100 flex justify-center items-center">
      <div className=" max-w-xs ">
        <form className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              value={username}
              placeholder="Username"
              onChange={(e) => dispatch(updateUsernameField(e.target.value))}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border border-red-500 rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              placeholder="******************"
              onChange={(e) => dispatch(updatePasswordField(e.target.value))}
            />
            {authError && <p className="text-red-500 text-xs italic">{authError}</p>}
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={() => dispatch(signInUser())}
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegistrationPage
