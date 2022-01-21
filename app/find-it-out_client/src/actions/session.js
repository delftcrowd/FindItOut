import { SET_COMPLETED, SET_FRESH_LOGIN, SET_ONLINE_COUNT, SET_PROGRESS, SET_SESSION } from "../constants/AppConstants";

export const setSession = session => {
  return {
    type: SET_SESSION,
    payload: session
  }
};

export const setFreshLogin = fresh => {
  return {
    type: SET_FRESH_LOGIN,
    payload: fresh
  }
};

export const setOnlineCount = count => {
  return {
    type: SET_ONLINE_COUNT,
    payload: count
  }
};

export const setProgress = progress => {
  return { type: SET_PROGRESS, payload: progress }
}

export const setCompleted = completed => {
  return { type: SET_COMPLETED, payload: completed }
}