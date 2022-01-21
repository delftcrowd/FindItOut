import toast from 'react-hot-toast'
import {
  CHANGE_FORM, LOADING_AUTH, SENDING_REQUEST, SET_AUTH, SET_DATA, SET_ERROR_MESSAGE, SET_PROGRESS
} from '../constants/AppConstants'
import api from '../utils/api'
import { authLogin, authLogout, getAccessToken, removeAccessToken, removeRefreshToken, setAccessToken, setRefreshToken } from '../utils/auth'
import { setMe } from './game'
import { setCompleted, setOnlineCount, setProgress } from './session'



// --------------- AXIOS

export const login = (username, password) => {
  return dispatch => {
    dispatch(sendingRequest(true))
    dispatch(setErrorMessage(''))
    api.post(`/api/login`, { username, password })
      .then(data => {
        authLogin(data.data)
        setAccessToken(data.data.access_token)
        setRefreshToken(data.data.refresh_token)
        // dispatch(setAuthState(data.data.isLoggedIn))
      })
      .catch(error => {
        if (error.response) {
          dispatch(setErrorMessage(error.response.statusText))
        }
      })
      .finally(() => {
        dispatch(sendingRequest(false))
      })
  }
}

export const register = (username, password, pid = undefined) => {
  return dispatch => {
    dispatch(sendingRequest(true))
    dispatch(setErrorMessage(''))
    api.post(`/api/register`, pid ? { username, password, pid } : { username, password })
      .then(data => {
        authLogin(data.data)
        setAccessToken(data.data.access_token)
        setRefreshToken(data.data.refresh_token)
        // dispatch(setAuthState(data.data.isLoggedIn))
      })
      .catch(error => {
        if (error.response) {
          dispatch(setErrorMessage(error.response.statusText))
        }
      })
      .finally(() => {
        dispatch(sendingRequest(false))
      })
  }
}

export const loadMe = () => {
  return dispatch => {
    dispatch(sendingRequest(true))
    dispatch(setErrorMessage(''))
    api.get(`/api/me`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
      .then(data => {
        // No problem, token still valid
        dispatch(setMe(data.data.username))
      })
      .catch(error => {
        if (error.response) {
          dispatch(setErrorMessage(error.response.statusText))
        }
        toast.error('Login session expired. Please log in again.', { id: 'credentials', duration: 5000 })
        authLogout()
        removeAccessToken()
        removeRefreshToken()
      })
      .finally(() => {
        dispatch(sendingRequest(false))
      })
  }
}

export const loadOnlinePlayers = () => {
  return dispatch => {
    dispatch(sendingRequest(true))
    dispatch(setErrorMessage(''))
    api.get(`/api/players_online`)
      .then(data => {
        dispatch(setOnlineCount(data.data))
      })
      .catch(error => {
        if (error.response) {
          dispatch(setErrorMessage(error.response.statusText))
        }
      })
      .finally(() => {
        dispatch(sendingRequest(false))
      })
  }
}

export const refreshProgress = () => {
  return dispatch => {
    api.get('/api/progress', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      },
      timeout: 5000
    }).then(data => {
      const p = data.data.progress
      const completed = data.data.completed ? true : false
      if (p !== undefined && p !== null) {
        dispatch(setProgress(p))
        dispatch(setCompleted(completed))
      } else {
        // TODO else condition for when the server could not find user / not is a user without prolific id.
      }
    })
  }
}

export const logout = () => {
  return dispatch => {
    dispatch(sendingRequest(true))
    dispatch(setErrorMessage(''))
    api.get('/api/logout', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
      .then(data => {
        authLogout()
        removeAccessToken()
        removeRefreshToken()
        localStorage.clear()
      })
      .catch(error => {
        if (error.response) {
          dispatch(setErrorMessage(error.response.statusText))
        }
      })
      .finally(() => {
        dispatch(sendingRequest(false))
      })
  }
}

// -------------- AUTH
export const setErrorMessage = message => {
  return { type: SET_ERROR_MESSAGE, payload: message }
}

export const changeForm = newState => {
  return { type: CHANGE_FORM, payload: newState }
}

export const setAuthState = newState => {
  return { type: SET_AUTH, payload: newState }
}

export const sendingRequest = sending => {
  return { type: SENDING_REQUEST, payload: sending }
}

export const loadingAuth = sending => {
  return { type: LOADING_AUTH, payload: sending }
}

export const setData = data => {
  return { type: SET_DATA, payload: data }
}
