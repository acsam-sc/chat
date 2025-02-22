/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import PropTypes from 'prop-types'
import { Provider, useSelector } from 'react-redux'
import { ConnectedRouter } from 'connected-react-router'
import { Switch, Route, Redirect, StaticRouter } from 'react-router-dom'

import store, { history } from '../redux'

import NotFound from '../components/404'
import App from '../components/app'
import RegistrationPage from '../components/registration'
import LoginPage from '../components/login'

import Startup from './startup'

const OnlyAnonymousRoute = ({ component: Component, ...rest }) => {
  const auth = useSelector((s) => s.auth)
  const func = (props) =>
    auth.username && auth.token ? <Redirect to={{ pathname: '/chat' }} /> : <Component {...props} />
  return <Route {...rest} render={func} />
}

const PrivateRoute = ({ component: Component, ...rest }) => {
  const auth = useSelector((s) => s.auth)
  const func = (props) =>
    auth.username && auth.token ? (
      <Component {...props} />
    ) : (
      <Redirect
        to={{
          pathname: '/login'
        }}
      />
    )
  return <Route {...rest} render={func} />
}

const types = {
  component: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string
  }),
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string
  }),
  token: PropTypes.string
}

const defaults = {
  location: {
    pathname: ''
  },
  user: null,
  token: ''
}

OnlyAnonymousRoute.propTypes = types
PrivateRoute.propTypes = types

PrivateRoute.defaultProps = defaults
OnlyAnonymousRoute.defaultProps = defaults

const RouterSelector = (props) =>
  typeof window !== 'undefined' ? <ConnectedRouter {...props} /> : <StaticRouter {...props} />

const RootComponent = (props) => {
  return (
    <Provider store={store}>
      <Startup>
        <RouterSelector history={history} location={props.location} context={props.context}>
          <Switch>
            <Route exact path="/" component={() => <LoginPage />} />
            <PrivateRoute exact path="/chat" component={() => <App />} />
            <OnlyAnonymousRoute exact path="/registration" component={() => <RegistrationPage />} />
            <OnlyAnonymousRoute exact path="/login" component={() => <LoginPage />} />
            <Route component={() => <NotFound />} />
          </Switch>
        </RouterSelector>
      </Startup>
    </Provider>
  )
}

export default RootComponent
