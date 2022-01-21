import {
  CHANGE_FORM, LOADING_AUTH, SENDING_REQUEST, SET_AUTH, SET_COMPLETED, SET_DATA, SET_ERROR_MESSAGE, SET_FRESH_LOGIN, SET_ONLINE_COUNT, SET_PROGRESS
} from '../constants/AppConstants'

export const changeForm = (state = { username: '', password: '' }, action) => {
  if (action.type === CHANGE_FORM) {
    return {
      ...state,
      ...action.payload
    }
  } else {
    return state
  }
}

export const sendingRequest = (state = false, action) => {
  if (action.type === SENDING_REQUEST) {
    return action.payload
  } else {
    return state
  }
}

export const loadingAuth = (state = true, action) => {
  if (action.type === LOADING_AUTH) {
    return action.payload
  } else {
    return state
  }
}

export const setAuth = (state = false, action) => {
  if (action.type === SET_AUTH) {
    return action.payload
  } else {
    return state
  }
}

export const setErrorMessage = (state = '', action) => {
  if (action.type === SET_ERROR_MESSAGE) {
    return action.payload
  } else {
    return state
  }
}

export const setData = (state = { home: '', protected: '' }, action) => {
  if (action.type === SET_DATA) {
    return {
      ...state,
      ...action.payload
    }
  } else {
    return state
  }
}

export const setOnlineCount = (state = { waiting: [], playing: 0 }, action) => {
  if (action.type === SET_ONLINE_COUNT) {
    return action.payload
  } else {
    return state
  }
}

export const setProgress = (state = {}, action) => {
  if (action.type === SET_PROGRESS) {
    return action.payload
  } else {
    return state
  }
}

export const setCompleted = (state = false, action) => {
  if (action.type === SET_COMPLETED) {
    return action.payload
  } else {
    return state
  }
}

export const setFreshLogin = (state = false, action) => {
  if (action.type === SET_FRESH_LOGIN) {
    return action.payload
  } else {
    return state
  }
}
