import { ACTION_NONE, SET_ANSWER, SET_ASKER_ACTION, SET_CARDS, SET_DIFFICULTY, SET_FORFEITED, SET_GAMEOVER, SET_GUESS_CARD, SET_INSTRUCTIONS_SHOWN, SET_IT_CARD, SET_ME, SET_OPPONENT, SET_OPPONENT_IT_CARD, SET_QUESTION, SET_QUESTION_HISTORY, SET_RELATIONS, SET_REPORT_CHECKED, SET_ROLE, SET_SESSION, SET_STAGE, SET_TARGET_INPUT, SET_TARGET_RELATION, SET_TEXT_MODE, SET_TURN, SET_WON } from '../constants/AppConstants'
import { insertIntoArray } from '../utils/insertIntoArray'


export const setInstructionsShown = (state = false, action) => {
  if (action.type === SET_INSTRUCTIONS_SHOWN) {
    return action.payload
  } else {
    return state
  }
}

export const setSession = (state = '', action) => {
  if (action.type === SET_SESSION) {
    return action.payload
  } else {
    return state
  }
}

export const setDifficulty = (state = 0, action) => {
  if (action.type === SET_DIFFICULTY) {
    return action.payload
  } else {
    return state
  }
}

export const setMyTurn = (state = false, action) => {
  if (action.type === SET_TURN) {
    return action.payload
  } else {
    return state
  }
}

export const setRole = (state = '', action) => {
  if (action.type === SET_ROLE) {
    return action.payload
  } else {
    return state
  }
}

export const setCards = (state = [], action) => {
  if (action.type === SET_CARDS) {
    if (action.singleCard) {
      return insertIntoArray(state, action.payload,
        { ...state[action.payload], is_flipped: (!state[action.payload].is_flipped) }
      )
    } else {
      return action.payload
    }
  } else {
    return state
  }
}

export const setItCard = (state = { id: '', image_url: '' }, action) => {
  if (action.type === SET_IT_CARD) {
    return action.payload
  } else {
    return state
  }
}

export const setOpponentItCard = (state = { id: '', image_url: '' }, action) => {
  if (action.type === SET_OPPONENT_IT_CARD) {
    return action.payload
  } else {
    return state
  }
}

export const setMe = (state = '', action) => {
  if (action.type === SET_ME) {
    return action.payload
  } else {
    return state
  }
}

export const setOpponent = (state = '', action) => {
  if (action.type === SET_OPPONENT) {
    return action.payload
  } else {
    return state
  }
}

export const setRelations = (state = [], action) => {
  if (action.type === SET_RELATIONS) {
    return action.payload
  } else {
    return state
  }
}

export const setTargetRelation = (state = -1, action) => {
  if (action.type === SET_TARGET_RELATION) {
    return action.payload
  } else {
    return state
  }
}

export const setTargetInput = (state = "", action) => {
  if (action.type === SET_TARGET_INPUT) {
    return action.payload
  } else {
    return state
  }
}

export const setAskerAction = (state = ACTION_NONE, action) => {
  if (action.type === SET_ASKER_ACTION) {
    return action.payload
  } else {
    return state
  }
}

export const setGuessCard = (state = -1, action) => {
  if (action.type === SET_GUESS_CARD) {
    return action.payload
  } else {
    return state
  }
}

export const setStage = (state = "", action) => {
  if (action.type === SET_STAGE) {
    return action.payload
  } else {
    return state
  }
}

export const setQuestion = (state = "", action) => {
  if (action.type === SET_QUESTION) {
    return action.payload
  } else {
    return state
  }
}

export const setAnswer = (state = '', action) => {
  if (action.type === SET_ANSWER) {
    return action.payload
  } else {
    return state
  }
}

export const setReportChecked = (state = [], action) => {
  if (action.type === SET_REPORT_CHECKED) {
    // reset report checked if passed in null
    if (action.payload === null) {
      return []
    }
    const currentIndex = state.indexOf(action.payload)
    const newChecked = [...state]

    if (currentIndex === -1) {
      newChecked.push(action.payload)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    return newChecked
  } else {
    return state
  }
}

export const setGameover = (state = false, action) => {
  if (action.type === SET_GAMEOVER) {
    return action.payload
  } else {
    return state
  }
}

export const setForfeited = (state = false, action) => {
  if (action.type === SET_FORFEITED) {
    return action.payload
  } else {
    return state
  }
}

export const setWon = (state = false, action) => {
  if (action.type === SET_WON) {
    return action.payload
  } else {
    return state
  }
}

export const setTextMode = (state = false, action) => {
  if (action.type === SET_TEXT_MODE) {
    return action.payload
  } else {
    return state
  }
}

export const setQuestionHistory = (state = [], action) => {
  if (action.type === SET_QUESTION_HISTORY) {
    return action.payload
  } else {
    return state
  }
}