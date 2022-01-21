import React from 'react'
import { useCookies } from 'react-cookie'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { Alert } from 'react-st-modal'
import io from 'socket.io-client'
import { setAnswer, setCards, setForfeited, setGameover, setItCard, setMe, setOpponent, setOpponentItCard, setQuestion, setQuestionHistory, setRelations, setRole, setSession, setStage, setTurn, setWon } from '../actions/game'
import bellsSound from '../audio/bells.mp3'
import failSound from '../audio/fail.mp3'
import successSound from '../audio/success.mp3'
import { AUDIO_ENABLED, SERVER_URL } from '../constants/AppConstants'
import { getAccessToken } from './auth'
import useCustomSound from './useCustomSound'
import useLegacySound from './useLegacySound'

let socket

export default ({ children }) => {
  const dispatch = useDispatch()
  const history = useHistory()
  const playWon = useLegacySound(successSound, 0.5)
  const playLose = useLegacySound(failSound, 0.35)
  const playTurn = useLegacySound(bellsSound, 0.5)

  if (!socket) {
    console.log('loading socket once')

    socket = io(SERVER_URL, {
      // withCredentials: true,
      reconnectionAttempts: 5, reconnectionDelay: 2000, reconnectionDelayMax: 5000,
      autoConnect: false,
      transports: ['polling', 'websocket'],
      transportOptions: {
        polling: {
          extraHeaders: {
            "Authorization": `${getAccessToken() ?
              `Bearer ${getAccessToken()}` : ''}`
          }
        },
      }
    })


    socket.on("connect", () => {
      console.log("Connected to server")
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from server")
    })

    socket.on("session", (game_session) => {
      console.log(`Joined game session ${game_session}`)
      dispatch(setSession(game_session))
    })

    socket.on("turn", (isMyTurn) => {
      console.log(isMyTurn ? "It is my turn now" : "It is the opponents turn")
      dispatch(setTurn(isMyTurn))
      if (isMyTurn) {
        toast.success("It is your turn now!", { id: 'turn', duration: 5000 })
        playTurn()
      }
    })

    socket.on("role", (myRole) => {
      console.log(`I am the ${myRole}`)
      dispatch(setRole(myRole))
    })

    socket.on("cards", (cards) => {
      console.log("Received set of cards", cards)
      dispatch(setCards(cards))
    })

    socket.on("itCard", (itCard) => {
      console.log("Received my IT card", itCard)
      dispatch(setItCard(itCard))
    })

    socket.on("opponentItCard", (itCard) => {
      console.log("Received opponent's IT card", itCard)
      dispatch(setOpponentItCard(itCard))
    })

    socket.on("me", (me) => {
      console.log(`I am ${me}`)
      dispatch(setMe(me))
    })

    socket.on("opponent", (opponent) => {
      console.log(`Opponent is ${opponent}`)
      dispatch(setOpponent(opponent))
    })

    socket.on("start", () => {
      console.log('Starting game!')
      // fixes bug where game would be stuck at end screen
      dispatch(setGameover(false))
      history.push('/play')
    })

    socket.on("relations", (relations) => {
      console.log("Receiving relations!", relations)
      dispatch(setRelations(relations))
    })

    socket.on("stage", (stage) => {
      console.log(`Current stage is ${stage}`)
      dispatch(setStage(stage))
    })

    socket.on("question", (question) => {
      console.log(`Current question is ${question}`)
      dispatch(setQuestion(question))
    })

    socket.on("answer", (answer) => {
      console.log(`The answer was ${answer}`)
      dispatch(setAnswer(answer))
    })

    socket.on("questionHistory", (history) => {
      console.log(`Updated question history ${history}`)
      dispatch(setQuestionHistory(history))
    })

    socket.on("gameover", (forfeited) => {
      console.log(`The game ended`)
      dispatch(setForfeited(forfeited))
      dispatch(setGameover(true))
    })

    socket.on("won", (won) => {
      console.log(`You won = ${won}`)
      dispatch(setWon(won))
      if (won) {
        playWon()
      } else {
        playLose()
      }
    })

    socket.on("leave", (player) => {
      toast.dismiss('success')
      toast.error(`The opponent '${player}' left the game!\nIf the player does not rejoin, you can forfeit the game from the menu to forcefully end this game session.`, { id: 'error', duration: 10000 })
      console.log(`${player} left the game!`)
    })

    socket.on("join", (player) => {
      toast.dismiss('error')
      toast.success(`The opponent '${player}' joined the game!`, { id: 'success', duration: 5000 })
      console.log(`${player} joined the game!`)
    })

    socket.on("retry", () => {
      toast(`Your opponent replied UNCLEAR. Try rewording or changing the question.`, { id: 'info', duration: 10000, icon: '❗' })
      console.log(`Retrying round`)
    })

    socket.on("forfeit", () => {
      toast(`Your opponent forfeited the game.`, { id: 'info', duration: 5000, icon: '❗' })
      console.log(`Opponent forfeited`)
    })

    socket.on("bonus", () => {
      // toast(`Your opponent guessed your card correctly! You can still take a guess of the opponents card!`, { id: ' info', duration: 10000, icon: '❗' })
      Alert(<p>Your opponent guessed your card correctly! <br />You can still take a guess of the opponents card.</p>, 'Bonus guess')
      console.log(`Opponent won. Playing bonus round.`)
    })

    // CONNECTION ERRORS

    socket.on('connect_error', err => {
      toast.error('Encountered an error when connecting to server. Please report this to the developers!', { id: 'connection', duration: 5000 })
    })

    socket.on('connect_failed', err => {
      toast.error('Failed to connect to server. Please report this to the developers!', { id: 'connection', duration: 5000 })
    })

    socket.on('error', err => {
      console.log(err)
      toast.error('Error happened...', { id: 'error', duration: 5000 })
    })
  }


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}

export const SocketContext = React.createContext()