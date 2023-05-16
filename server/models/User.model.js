import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    roles: {
      type: [String],
      default: ['user']
    },
    userpic: {
      data: Buffer,
      contentType: String
    },
    createdAt: {
      type: Date,
      default: +new Date()
    }
  },
  {
    timestamp: true
  }
)
// eslint-disable-next-line func-names
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  this.password = bcrypt.hashSync(this.password)
  return next()
})

userSchema.method({
  passwordMatches(password) {
    return bcrypt.compareSync(password, this.password)
  }
})

userSchema.statics = {
  async findAndValidateUser({ username, password }) {
    if (!username) {
      throw new Error('No Username')
    }
    if (!password) {
      throw new Error('No Password')
    }

    const user = await this.findOne({ username }).exec()
    if (!user) {
      throw new Error('Username or Password is Incorrect')
    }

    const isPasswordOk = await user.passwordMatches(password)

    if (!isPasswordOk) {
      throw new Error('Username or Password is Incorrect')
    }

    return user
  }
}

export default mongoose.model('users', userSchema)
