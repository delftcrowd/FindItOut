import axios from 'axios'
import { ACCESS_TOKEN_NAME, SERVER_URL } from '../constants/AppConstants'
import { getRefreshToken } from './auth'

axios.defaults.headers.common['Accept'] = 'application/json'
axios.defaults.headers.post['Content-Type'] = 'application/json'

const api = axios.create({
  baseURL: SERVER_URL,
  responseType: 'json',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})


// Function that will be called to refresh authorization
const refreshAuthLogic = failedRequest => {
  api.post('/api/refresh', { headers: { 'Authorization': `Bearer ${getRefreshToken()}` } })
    .then(tokenRefreshResponse => {
      localStorage.setItem(ACCESS_TOKEN_NAME, tokenRefreshResponse.data.access_token)
      failedRequest.response.config.headers['Authorization'] = 'Bearer ' + tokenRefreshResponse.data.access_token
      return Promise.resolve()
    }).catch(error => {
      if (error.response) {
        dispatch(setErrorMessage(error.response.statusText))
      }
    })
}

export default api