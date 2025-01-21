import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import PropTypes from 'prop-types'
// import { trySignIn, tryGetUserInfo } from '../redux/reducers/auth'
import { trySignIn } from '../redux/reducers/auth'

const Startup = (props) => {
  const dispatch = useDispatch()
  const { token, username } = useSelector((s) => s.auth)
  useEffect(() => {
    if (token && !username) {
      dispatch(trySignIn())
      // dispatch(tryGetUserInfo())
    }
  }, [dispatch, token, username])

  return props.children
}

Startup.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired
}

export default Startup
