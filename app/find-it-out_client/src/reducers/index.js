import { combineReducers } from 'redux'
import { changeForm, loadingAuth, sendingRequest, setCompleted, setData, setErrorMessage, setFreshLogin, setOnlineCount, setProgress } from './auth'
import { setAnswer, setAskerAction, setCards, setDifficulty, setForfeited, setGameover, setGuessCard, setInstructionsShown, setItCard, setMe, setMyTurn, setOpponent, setOpponentItCard, setQuestion, setQuestionHistory, setRelations, setReportChecked, setReportChoice, setRole, setSession, setStage, setTargetInput, setTargetRelation, setTextMode, setWon } from './game'

const rootReducer = combineReducers({
  changeForm,
  currentlySending: sendingRequest,
  loadingAuth,
  errorMessage: setErrorMessage,
  data: setData,
  freshLogin: setFreshLogin,
  onlineCount: setOnlineCount,
  progress: setProgress,
  completed: setCompleted,
  gameSession: setSession,
  gameDifficulty: setDifficulty,
  instructionsShown: setInstructionsShown,
  game: combineReducers({
    myTurn: setMyTurn,
    role: setRole,
    cards: setCards,
    itCard: setItCard,
    opponentItCard: setOpponentItCard,
    me: setMe,
    opponent: setOpponent,
    relations: setRelations,
    target: combineReducers({
      index: setTargetRelation,
      value: setTargetInput
    }),
    action: setAskerAction,
    guess: setGuessCard,
    stage: setStage,
    question: setQuestion,
    answer: setAnswer,
    questionHistory: setQuestionHistory,
    reportChecked: setReportChecked,
    textMode: setTextMode,
    forfeited: setForfeited,
    gameover: setGameover,
    won: setWon
  })
})

export default rootReducer