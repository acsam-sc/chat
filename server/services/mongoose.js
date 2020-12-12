import mongoose from 'mongoose'
import config from '../config'

mongoose.connection.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log('MongoDB is connected')
})

mongoose.connection.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log(`Cannot connect to MongoDB. Error: ${err}`)
})

exports.connect = async (mongoURL = config.mongoURL) => {
  mongoose.connect(mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  return mongoose.connection
}
