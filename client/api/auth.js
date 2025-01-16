import axios from 'axios'

// REG requests
export const sendRegData = async (formData) => axios.post('/api/v1/reg', formData)

// AUTH requests
export const getAuth = async () => axios.get('/api/v1/auth')
export const sendAuthData = async (authData) => axios.post('/api/v1/auth', authData)

// MISC requests
export const getOnlineUsers = async () => axios.get('/api/v1/onlineusers')
