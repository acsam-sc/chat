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

const { readFile, writeFile, unlink } = require('fs').promises

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

const port = process.env.PORT || 8090
const server = express()

const goodsFile = `${__dirname}/goods.json`
const logFile = `${__dirname}/logs.json`

const writeGoodsFile = async (data) =>
  writeFile(goodsFile, JSON.stringify(data), { encoding: 'utf8' })

const readGoodsFile = async () => {
  const fileData = await readFile(goodsFile, { encoding: 'utf-8' })
    .then((data) => JSON.parse(data))
    .catch(async (err) => {
      if (err.code === 'ENOENT') {
        const resData = await axios(
          'https://raw.githubusercontent.com/ovasylenko/skillcrcuial-ecommerce-test-data/master/data.json'
        )
          .then(({ data }) => {
            writeGoodsFile(data)
            return data
          })
          // eslint-disable-next-line no-console
          .catch((errAxios) => console.log(`Error in axios: ${errAxios}`))
        return resData
      }
      return err
    })
  return fileData
}

const readLogFile = async () => {
  const fileData = await readFile(logFile, { encoding: 'utf8' })
    .then((data) => JSON.parse(data))
    .catch(async (err) => {
      if (err.code === 'ENOENT') {
        const dataToWrite = [{ date: +new Date(), action: '===== Log start =====' }]
        await writeFile(logFile, JSON.stringify(dataToWrite), { encoding: 'utf8' })
        return dataToWrite
      }
      return err
    })
  return fileData
}

// const writeLogFile = async (action) => {
//   const fileData = await readLogFile()
//   const dataToWrite = fileData.concat({ date: +new Date(), action })
//   await writeFile(logFile, JSON.stringify(dataToWrite), { encoding: 'utf8' })
// }

const deleteLogFile = async () => unlink(logFile)

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

server.get('/api/v1/products', async (req, res) => {
  const { page = 1, count = 20 } = req.query
  const data = await readGoodsFile()
  const compareAZ = (a, b) => {
    if (a.title < b.title) return -1
    if (a.title > b.title) return 1
    return 0
  }

  const compareZA = (a, b) => {
    if (a.title > b.title) return -1
    if (a.title < b.title) return 1
    return 0
  }

  const sortAZ = () => {
    const titlesArray = data
      .map((it, index) => {
        return { index, title: it.title }
      })
      .sort(compareAZ)
    return titlesArray.map((it) => data[it.index])
  }

  const sortZA = () => {
    const titlesArray = data
      .map((it, index) => {
        return { index, title: it.title }
      })
      .sort(compareZA)
    return titlesArray.map((it) => data[it.index])
  }

  const sortByPriceLowHigh = () => {
    const pricesArray = data
      .map((it, index) => {
        return { index, price: it.price }
      })
      .sort((a, b) => a.price - b.price)
    return pricesArray.map((it) => data[it.index])
  }

  const sortByPriceHighLow = () => {
    const pricesArray = data
      .map((it, index) => {
        return { index, price: it.price }
      })
      .sort((a, b) => b.price - a.price)
    return pricesArray.map((it) => data[it.index])
  }

  const sortedItems = () => {
    switch (req.query.sortby) {
      case 'a-z':
        return sortAZ()
      case 'z-a':
        return sortZA()
      case 'priceAsc':
        return sortByPriceLowHigh()
      case 'priceDesc':
        return sortByPriceHighLow()
      default:
        return data
    }
  }

  const portionToSend = sortedItems().slice((page - 1) * count, page * count)
  res.json({ items: portionToSend, totalCount: data.length })
})

server.get('/api/v1/logs', async (req, res) => {
  const response = await readLogFile()
  res.json(response)
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
    // connections.forEach((c) => {
    //   c.write(JSON.stringify({ type: 'SHOW_MESSAGE', message: `${user.username} just logged in` }))
    // })
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
    connections.forEach((c) => {
      // c.write(JSON.stringify({ type: 'USER_INFO', user: user.username, id: user.id }))
      c.write(JSON.stringify({ type: 'SHOW_MESSAGE', message: `${user.username} just logged in` }))
    })
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
    // connections.forEach((c) => {
    //   c.write
    // })
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

const broadcast = (data) => {
  connections.forEach((c) => {
    c.write(JSON.stringify({ type: 'SHOW_MESSAGE', message: `message from ${data.username} message: ${data.message}` }))
  })
}

if (config.isSocketsEnabled) {
  const echo = sockjs.createServer()
  echo.on('connection', (conn) => {
    connections.push(conn)
    conn.write(JSON.stringify({ type: 'WELCOME_MESSAGE', connId: conn.id }))
    console.log('connections.push', connections)
    
    conn.on('data', (data) => {
      const parsedData = JSON.parse(data)
      // console.log('conn.on data', parsedData)
      if (parsedData.type === 'SHOW_MESSAGE') broadcast(parsedData)
      // console.log('parsedData', parsedData)
      if (parsedData.type === 'WELCOME_MESSAGE') console.log(`connectionID ${conn.id} is assigned to user ${parsedData.username}`)
    })

    conn.on('close', () => {
      connections = connections.filter((c) => c.readyState !== 3)
    })
  })
  echo.installHandlers(app, { prefix: '/ws' })
}
// eslint-disable-next-line no-console
console.log(`Serving at http://localhost:${port}`)
