import express from 'express'
import path from 'path'
import cors from 'cors'
import bodyParser from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'

import cookieParser from 'cookie-parser'
import passport from 'passport'
import jwt from 'jsonwebtoken'
import mongooseService from './services/mongoose'
import User from './models/User.model'
import passportJWT from './services/passport'
import auth from './middleware/auth'
import config from './config'
import Html from '../client/html'

mongooseService.connect()

const Root = () => ''

try {
  // eslint-disable-next-line import/no-unresolved
  // ;(async () => {
  //   const items = await import('../dist/assets/js/root.bundle')
  //   console.log(JSON.stringify(items))

  //   Root = (props) => <items.Root {...props} />
  //   console.log(JSON.stringify(items.Root))
  // })()
  // eslint-disable-next-line no-console
  console.log(Root)
} catch (ex) {
  // eslint-disable-next-line no-console
  console.log(' run yarn build:prod to enable ssr')
}

let connections = []
let connectedUsers = []

const port = process.env.PORT || 8090
const server = express()


const middleware = [
  cors(),
  passport.initialize(),
  express.static(path.resolve(__dirname, '../dist/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser()
]

passport.use('jwt', passportJWT.jwt)

middleware.forEach((it) => server.use(it))

server.get('/api/v1/exchangerate', async (req, res) => {
  const data = await axios.get(
    `https://api.exchangeratesapi.io/latest?symbols=${req.query.currency}`
  )
  res.json(data.data)
})

  // const portionToSend = sortedItems().slice((page - 1) * count, page * count)


server.get('/api/v1/messages', async (req, res) => {
  
})

server.get('/api/v1/auth', async (req, res) => {
  try {
    const jwtUser = jwt.verify(req.cookies.token, config.secret)
    const user = await User.findById(jwtUser.uid)
    const payload = { uid: user.id }
    const token = jwt.sign(payload, config.secret, { expiresIn: '48h' })
    delete user.password
    delete user['__v']
    res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 48 })
    res.json({ status: 'ok', token, user })
  } catch (err) {
    console.log(`Error on get '/api/v1/auth': ${err}`)
    res.json({ status: 'error', err })
  }  
})

server.get('/api/v1/user-info', auth([]), async (req, res) => {
  res.json({ status: 'user-info' })  
})

server.post('/api/v1/auth', async (req, res) => {
  console.log('request.body', req.body.body)
  try {
    const user = await User.findAndValidateUser(JSON.parse(req.body.body))
    const payload = { uid: user.id }
    const token = jwt.sign(payload, config.secret, { expiresIn: '48h' })
    delete user.password
    delete user['__v']
    res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 48 })
    res.json({ status: 'ok', token, user })
  } catch (err) {
    console.log(`Error on post '/api/v1/auth': ${err}`)
    res.json({ status: 'error', error: err.message })
  }
})

server.post('/api/v1/reg', async (req, res) => {
  console.log('/api/v1/reg request.body', req.body.body)
  const newUser = JSON.parse(req.body.body)
  try {
    const user = new User({
      username: newUser.username,
      password: newUser.password
    })
    user.save()
    delete user.password
    delete user['__v']
    res.json({ status: 'ok', user })
  } catch (err) {
    console.log(`Error on post '/api/v1/reg': ${err}`)
    res.json({ status: 'error', error: err.message })
  }
})

server.delete('/api/v1/logs', async (req, res) => {
  await deleteLogFile()
  res.json({ status: 'success' })
})

server.use('/api/', (req, res) => {
  res.status(404)
  res.end()
})

const [htmlStart, htmlEnd] = Html({
  body: 'separator',
  title: 'Skillcrucial - Become an IT HERO'
}).split('separator')

server.get('/', (req, res) => {
  const appStream = renderToStaticNodeStream(<Root location={req.url} context={{}} />)
  res.write(htmlStart)
  appStream.pipe(res, { end: false })
  appStream.on('end', () => {
    res.write(htmlEnd)
    res.end()
  })
})

server.get('/*', (req, res) => {
  const initialState = {
    location: req.url
  }

  return res.send(
    Html({
      body: '',
      initialState
    })
  )
})

const app = server.listen(port)

const broadcastUserMessage = (data, id) => {
  connections.forEach((c) => {
    if (c.id !== id) c.write(JSON.stringify(data))
  })
}

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    
    conn.on('data', (data) => {
      const timestamp = Date.now()
      // const parsedData = JSON.parse(data)
      console.log('parsedData', parsedData)
      if (parsedData.type === 'SHOW_MESSAGE') broadcastUserMessage(parsedData, conn.id)
      if (parsedData.type === 'WELCOME_MESSAGE' &&
        parsedData.username &&
        (connectedUsers.findIndex(it => it.connID === conn.id) < 0)) {
          connectedUsers = [...connectedUsers, { username: parsedData.username, connID: conn.id }]
          connections.forEach((c) => {
            c.write(JSON.stringify({
              type: 'SHOW_MESSAGE',
              channel: 'ALL',
              messageID: timestamp,
              timestamp,
              username: 'ChatInfo',
              message: `${parsedData.username} just logged in`
            }))
          })
        }
    })

    conn.on('close', () => {
      const timestamp = Date.now()
      connections = connections.filter((c) => c.readyState !== 3)
      connectedUsers = connectedUsers.filter(it => {
        if (it.connID === conn.id) {
          connections.forEach((c) => {
            c.write(JSON.stringify({
              type: 'SHOW_MESSAGE',
              channel: 'ALL',
              messageID: timestamp,
              timestamp,
              username: 'ChatInfo',
              message: `${it.username} just logged out`
            }))
          })
          return false
        }
        return true
      })
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
// eslint-disable-next-line no-console
console.log(`Serving at http://localhost:${port}`)
