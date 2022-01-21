import { createAuthProvider } from 'react-token-auth'
import { ACCESS_TOKEN_NAME, REFRESH_TOKEN_NAME } from '../constants/AppConstants'
import api from './api'

export const [useAuth, authFetch, authLogin, authLogout] = createAuthProvider({
  accessTokenKey: 'access_token',
  onUpdateToken: (token) => {
    refresh_token = token.refresh_token
    api.post('/api/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${refresh_token}`
      }
    })
      .then(r => r.json())
      .finally(() => {
        localStorage.removeItem('REACT_TOKEN_AUTH_KEY')
      })
  }
})

export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_NAME)
}

export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_NAME)
}

export const setAccessToken = (access_token) => {
  localStorage.setItem(ACCESS_TOKEN_NAME, access_token)
}

export const setRefreshToken = (refresh_token) => {
  localStorage.setItem(REFRESH_TOKEN_NAME, refresh_token)
}

export const removeAccessToken = () => {
  localStorage.removeItem(ACCESS_TOKEN_NAME)
}

export const removeRefreshToken = () => {
  localStorage.removeItem(REFRESH_TOKEN_NAME)
}
