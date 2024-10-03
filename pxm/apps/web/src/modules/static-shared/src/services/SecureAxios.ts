import axios from 'axios'

const access_token = ''

const instance = axios.create({
  baseURL: '/',
  auth: {
    username: process.env.API_USERNAME || '',
    password: process.env.API_PASSWORD || '',
  },
})

instance.interceptors.request.use(
  function (config) {
    const [hostname] = config.headers.host.split('.')
    config.headers['access-token'] = access_token
    config.headers['Content-Type'] = 'application/json; charset=utf-8'
    config.data = {
      ...config.data,
      hostname,
    }
    return config
  },
  function (err) {
    // Do something with request error
    return Promise.reject(err)
  }
)

axios.interceptors.response.use(
  function (response) {
    return response
  },
  function (error) {
    error.reporter = 'SecureAxios'

    return Promise.reject(error)
  }
)

export default instance
