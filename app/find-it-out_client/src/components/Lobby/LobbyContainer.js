import { Button } from '@material-ui/core'
import React, { useContext, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { CustomDialog } from 'react-st-modal'
import { setInstructionsShown } from '../../actions/game'
import { AUDIO_ENABLED, COOKIE_DISCLAIMER, COOKIE_DISCLAIMER_HIDE, COOKIE_DISCLAIMER_SHOW, difficulties } from '../../constants/AppConstants'
import { SocketContext } from '../../utils/WebSocketProvider'
import Tutorial from '../Game/Tutorial/Tutorial'


const LobbyContainer = () => {
  const socket = useContext(SocketContext)
  const opponent = useSelector(state => state.game.opponent)
  const difficulty = useSelector(state => state.gameDifficulty)
  const history = useHistory()
  const dispatch = useDispatch()

  const [cookies, setCookie] = useCookies([COOKIE_DISCLAIMER])

  useEffect(() => {
    console.log('trying to join')
    socket.connect()
    socket.emit("join", { 'difficulty': difficulties[difficulty].id }, (already_running) => {
      if (already_running) {
        history.push('/play')
      }
    })
  }, [])

  const redirectToHome = () => {
    socket.emit("leave")
    history.push('/')
  }

  const showTutorial = async () => {
    dispatch(setInstructionsShown(true))

    const result = await CustomDialog(
      <Tutorial original={cookies[COOKIE_DISCLAIMER] === COOKIE_DISCLAIMER_HIDE} />,
      {
        title: 'Tutorial',
        showCloseIcon: true,
      }
    )

    if (result !== 'undefined') {
      dispatch(setInstructionsShown(false))
    }

    const res = result || (cookies[COOKIE_DISCLAIMER] === 'undefined' ? false : cookies[COOKIE_DISCLAIMER]) || COOKIE_DISCLAIMER_SHOW

    // hide for a month
    setCookie(COOKIE_DISCLAIMER, res, { path: '/', maxAge: 30 * 86400 })
  }

  return (
    <div>
      {((opponent === null || opponent === '') ? (
        <div className="Loader">
          <div style={{ flexGrow: "1" }}></div>
          <div className="Loader_Icon"></div>
          <span className="text-center">
            <span className="text-xlarge">Please wait...</span>
            <span className="text-xlarge">The other player is on the way!</span>
          </span>
          <span className="text-smaller mb-2">(This might take a few minutes, please be patient. Refresh if necessary.)</span>
          <Button
            label="Instructions"
            variant="text"
            color="inherit"
            className="MenuButton mb-4"
            style={{ width: 'max-content', padding: '1em 2em' }}
            size="small"
            onClick={showTutorial}
            disableElevation
          >Read instructions</Button>
          <div style={{ flexGrow: "1" }}></div>
          <a className="AuthButton btn btn-primary text-small mb-4" style={{ padding: '0.8em' }} onClick={redirectToHome}>Back to main menu</a>
        </div>
      ) : (
        <div className="Loader">
          <div className="Loader_Icon"></div>
          <span className="text-xlarge">Matched player {opponent}!</span>
          <span>Game will be starting soon...</span>
          <span className="text-small">(Refresh if you see this screen. This is a bug.)</span>
        </div>
      )
      )}
    </div>
  )
}

export default LobbyContainer