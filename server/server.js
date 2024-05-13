import express from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import bodyParser, { raw } from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
import axios from 'axios'
import formidable from 'express-formidable'

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
  express.static(path.resolve(__dirname, '../client/assets')),
  bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }),
  bodyParser.json({ limit: '50mb', extended: true }),
  cookieParser()
]

passport.use('jwt', passportJWT.jwt)

middleware.forEach((it) => server.use(it))
// server.use('/api/v1/auth', formidable())

if (!fs.existsSync(path.join(__dirname, '..', 'client', 'assets', 'images', 'userpics'))) fs.mkdirSync(__dirname, '..', 'client', 'assets', 'images', 'userpics')

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
  res.json({ status: 'ok', onlineUsers: connectedUsers })
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

server.post('/api/v1/reg', formidable({uploadDir: path.join(__dirname, '..', 'client', 'assets', 'images', 'userpics')}), async (req, res) => {
  const { username, password } = req.fields
  console.log('userpic.path=', req.files.userpic)
  // const userpicFile = {
  //   data: fs.readFileSync(req.files.userpic.path),
  //   contentType: req.files.userpic.type
  // }
  try {
    const user = new User({
      username,
      password
    })
    const oldPath = req.files.userpic.path
    const newPath = path.join(__dirname, '..', 'client', 'assets', 'images', 'userpics', username) + '.jpg'
    const rawData = fs.readFileSync(oldPath)
    fs.writeFileSync(newPath, rawData)
    if (fs.existsSync(req.files.userpic.path)) fs.unlinkSync(req.files.userpic.path)
    user.save()
    delete user.password
    delete user['__v']
    const payload = { uid: user.id }
    const token = jwt.sign(payload, config.secret, { expiresIn: '48h' })
    res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 48 })
    res.json({ status: 'ok', token, user })
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
    
    conn.on('data', async (data) => {
      const timestamp = Date.now()
      const parsedData = JSON.parse(data)
      if (parsedData.type === 'SHOW_MESSAGE') broadcastUserMessage(parsedData, conn.id)
      if (parsedData.type === 'WELCOME_MESSAGE' &&
        parsedData.username &&
        (connectedUsers.findIndex(it => it.connID === conn.id) < 0)) {
          const user = await User.findOne({ username: parsedData.username }).exec()
          connectedUsers = [...connectedUsers, { username: parsedData.username, connID: conn.id, userpic: user.userpic }]
          connections.forEach((c) => {
            c.write(JSON.stringify({
              type: 'USER_LOGIN',
              messageID: timestamp,
              timestamp,
              username: parsedData.username,
              userpic: user.userpic
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
              type: 'USER_LOGOUT',
              messageID: timestamp,
              timestamp,
              username: it.username
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
