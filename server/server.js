import express from 'express'
import path from 'path'
import fs from 'fs'
import cors from 'cors'
import bodyParser, { raw } from 'body-parser'
import sockjs from 'sockjs'
import { renderToStaticNodeStream } from 'react-dom/server'
import React from 'react'
// import axios from 'axios'
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
  console.log('run yarn build:prod to enable ssr')
}

let connections = []
let connectedUsers = []

const port = process.env.PORT || 8090
const server = express()
const picsDir = path.join(__dirname, '..', 'dist', 'assets', 'images', 'userpics')


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

if (!fs.existsSync(picsDir)) fs.mkdirSync(picsDir)

server.get('/api/v1/messages', auth([]), async (req, res) => {
  
})

server.get('/api/v1/auth', async (req, res) => {
  // console.log('get /api/v1/auth req.body', req.cookies)
  try {
    const jwtUser = jwt.verify(req.cookies.token, config.secret)
    const userDB = await User.findById(jwtUser.uid)
    const user = userDB.toObject()
    const payload = { uid: userDB.id }
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

server.get('/api/v1/onlineusers', auth([]), async (req, res) => {
  const usersToSend = connectedUsers.map((it) => it.username)
  res.json({ status: 'ok', onlineUsers: usersToSend })
})

server.get('/api/v1/user-info', async (req, res) => {
  console.log('/api/v1/user-info req.body', req.body)
  try {
    const userDB = await User.findUser(req.body)
    const user = userDB.toObject()
    delete user.password
    delete user['__v']
    res.json({ status: 'ok', user })
  } catch (err) {
    console.log(`Error on get '/api/v1/user-info': ${err}`)
    res.json({ status: 'error', error: err.message })
  }
})

server.post('/api/v1/auth', async (req, res) => {
  console.log('/api/v1/auth req.body', req.body)
  try {
    const userDB = await User.findAndValidateUser(req.body)
    const user = userDB.toObject()
    const payload = { uid: userDB.id }
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

server.post('/api/v1/reg', formidable({uploadDir: path.join(picsDir)}), async (req, res) => {
  const { username, password } = req.fields
  console.log('/api/v1/reg', username, password)
  const tempUserPic = req.files.userpic.path
  try {
    const userDB = await User.findUser({ username })
    if (userDB) res.json({ status: 'error', error: 'User already exists' })
    if (fs.existsSync(tempUserPic)) fs.unlinkSync(tempUserPic)
  } catch (err) {
    if (err.message === 'User not found') {
      try {
        const user = new User({
          username,
          password
        })
        const newPath = path.join(picsDir, username) + '.jpg'
        const newUserPic = fs.readFileSync(tempUserPic)
        fs.writeFileSync(newPath, newUserPic)
        if (fs.existsSync(tempUserPic)) fs.unlinkSync(tempUserPic)
        user.save()
        delete user.password
        delete user['__v']
        const payload = { uid: user.id }
        const token = jwt.sign(payload, config.secret, { expiresIn: '48h' })
        res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 48 })
        res.json({ status: 'ok', token, user })
      } catch (err) {
        console.log(`Error on creating new user at '/api/v1/reg': ${err}`)
      }
    } else {
      res.json({ status: 'error', error: err.message })
    }
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

const broadcastInfoMessage = (type, username) => {
  const timestamp = Date.now()
  connections.forEach((c) => {
    c.write(JSON.stringify({
      type,
      messageID: timestamp,
      timestamp,
      username
    }))
  })
}

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    
    conn.on('data', async (data) => {
      const parsedData = JSON.parse(data)
      if (parsedData.type === 'SHOW_MESSAGE') broadcastUserMessage(parsedData, conn.id)
      if (parsedData.type === 'WELCOME_MESSAGE' &&
        parsedData.username &&
        (connectedUsers.findIndex(it => it.connID === conn.id) < 0)) {
          // const user = await User.findOne({ username: parsedData.username }).exec()
          connectedUsers = [...connectedUsers, { username: parsedData.username, connID: conn.id }]
          broadcastInfoMessage('USER_LOGIN', parsedData.username)
        }
        // if (parsedData.type === 'GOODBYE_MESSAGE' &&
        //   parsedData.username) {
        //   // const connectedUsers = [{username: a, connID: 1}, {username: q, connID: 2}]
        //   const userConnections = connectedUsers.filter((it) => it.username === parsedData.username)
        //   userConnections.forEach(conn.)
        //   // const userConnections = [{username: a, connID: 1}]
        //   // connections = connections.filter((c) => userConnections.indexOf(c.connID) < 0)
        //   connectedUsers.filter(it => it.username !== parsedData.username)
        // }
    })

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
      connectedUsers = connectedUsers.filter(it => {
        if (it.connID === conn.id) {
          broadcastInfoMessage('USER_LOGOUT', it.username)
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
