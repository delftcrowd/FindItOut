import { SET_ANSWER, SET_ASKER_ACTION, SET_CARDS, SET_DIFFICULTY, SET_FORFEITED, SET_GAMEOVER, SET_GUESS_CARD, SET_INSTRUCTIONS_SHOWN, SET_IT_CARD, SET_ME, SET_OPPONENT, SET_OPPONENT_IT_CARD, SET_QUESTION, SET_QUESTION_HISTORY, SET_RELATIONS, SET_REPORT_CHECKED, SET_ROLE, SET_SESSION, SET_STAGE, SET_TARGET_INPUT, SET_TARGET_RELATION, SET_TEXT_MODE, SET_TURN, SET_WON } from "../constants/AppConstants"

// -------------- GAME

export const setInstructionsShown = visible => {
  return { type: SET_INSTRUCTIONS_SHOWN, payload: visible }
}

export const setDifficulty = difficulty => {
  return { type: SET_DIFFICULTY, payload: difficulty }
}

export const setStage = stage => {
  return { type: SET_STAGE, payload: stage }
}

export const setGuessCard = card => {
  return { type: SET_GUESS_CARD, payload: card }
}

export const setAskerAction = action => {
  return { type: SET_ASKER_ACTION, payload: action }
}

export const setTargetRelation = relation => {
  return { type: SET_TARGET_RELATION, payload: relation }
}

export const setTargetInput = input => {
  return { type: SET_TARGET_INPUT, payload: input }
}

export const setRelations = relations => {
  return { type: SET_RELATIONS, payload: relations }
}

export const setSession = game_session => {
  return { type: SET_SESSION, payload: game_session }
}

export const setTurn = turn => {
  return { type: SET_TURN, payload: turn }
}

export const setRole = role => {
  return { type: SET_ROLE, payload: role }
}

export const setCards = cards => {
  return { type: SET_CARDS, singleCard: false, payload: cards }
}

export const setItCard = card => {
  return { type: SET_IT_CARD, payload: card }
}

export const setMe = me => {
  return { type: SET_ME, payload: me }
}

export const setOpponent = opponent => {
  return { type: SET_OPPONENT, payload: opponent }
}

export const setQuestion = question => {
  return { type: SET_QUESTION, payload: question }
}

export const setAnswer = answer => {
  return { type: SET_ANSWER, payload: answer }
}

export const setQuestionHistory = history => {
  return { type: SET_QUESTION_HISTORY, payload: history }
}

export const setReportChecked = check => {
  return { type: SET_REPORT_CHECKED, payload: check }
}

export const setGameover = gameover => {
  return { type: SET_GAMEOVER, payload: gameover }
}

export const setForfeited = forfeited => {
  return { type: SET_FORFEITED, payload: forfeited }
}

export const setWon = won => {
  return { type: SET_WON, payload: won }
}

export const setOpponentItCard = itCard => {
  return { type: SET_OPPONENT_IT_CARD, payload: itCard }
}

export const flipCard = index => {
  return { type: SET_CARDS, singleCard: true, payload: index }
}

export const setTextMode = active => {
  return { type: SET_TEXT_MODE, payload: active }
}


// export const setInGame = newState => {
//   return { type: IN_GAME, payload: newState }
// }

// export const setGame = game => {
//   return { type: GET_GAME, payload: game }
// }