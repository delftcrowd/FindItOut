import { Button, Modal } from '@material-ui/core'
import { VolumeOff, VolumeUp } from '@material-ui/icons'
import { Fragment, useCallback, useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { useDispatch, useSelector } from 'react-redux'
import { Confirm, CustomDialog, StaticDialog } from 'react-st-modal'
import { setInstructionsShown, setTextMode } from '../../actions/game'
import { AUDIO_ENABLED, COOKIE_DISCLAIMER, COOKIE_DISCLAIMER_HIDE, COOKIE_DISCLAIMER_SHOW } from '../../constants/AppConstants'
import useEventListener from '../../utils/eventListener'
import useCustomSound from '../../utils/useCustomSound'
import { SocketContext } from '../../utils/WebSocketProvider'
import ActionBar from './ActionBar/ActionBar'
import Board from './Board/Board'
import StatusBar from './StatusBar/StatusBar'
import TopBar from './TopBar'
import Tutorial from './Tutorial/Tutorial'
import popSound from '../../audio/pop.wav'

export default function GameView() {
  const dispatch = useDispatch()
  const cards = useSelector(state => state.game.cards)
  const textMode = useSelector(state => state.game.textMode)
  const questionHistory = useSelector(state => state.game.questionHistory)
  const instructionsShown = useSelector(state => state.instructionsShown)

  const socket = useContext(SocketContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [cookies, setCookie] = useCookies([COOKIE_DISCLAIMER, AUDIO_ENABLED])
  const playPop = useCustomSound(popSound, 0.5)

  const showTutorial = async () => {
    const result = await CustomDialog(
      <Tutorial original={cookies[COOKIE_DISCLAIMER] === COOKIE_DISCLAIMER_HIDE} />,
      {
        title: 'Tutorial',
        showCloseIcon: true,
      }
    )

    const res = result || (cookies[COOKIE_DISCLAIMER] === 'undefined' ? false : cookies[COOKIE_DISCLAIMER]) || COOKIE_DISCLAIMER_SHOW

    if (result !== 'undefined') {
      dispatch(setInstructionsShown(false))
    }

    // hide for a month
    setCookie(COOKIE_DISCLAIMER, res, { path: '/', maxAge: 30 * 86400 })
  }

  const handleOpen = () => {
    setMenuOpen(true)
  }

  const handleClose = () => {
    setMenuOpen(false)
  }

  const openInstructions = () => {
    setMenuOpen(false)
    if (!instructionsShown) {
      dispatch(setInstructionsShown(true))
      showTutorial()
    }
  }

  const openHistory = () => {
    setMenuOpen(false)
    setHistoryOpen(true)
  }

  const toggleTextMode = () => {
    dispatch(setTextMode(!textMode))
  }

  const toggleSound = () => {
    if (cookies[AUDIO_ENABLED] !== 'true') {
      playPop({ forceSoundEnabled: true })
    }
    setCookie(AUDIO_ENABLED, !(cookies[AUDIO_ENABLED] === 'true'), { path: '/', maxAge: 30 * 86400 })
  }

  const endGame = async () => {
    setMenuOpen(false)
    if (await Confirm('Are you sure you want to forfeit the game? You will automatically lose and the task will not be count as completed.', 'Forfeit game?', 'End game', 'Cancel')) {
      socket.emit('forfeit_game')
    }
  }

  const handler = useCallback(
    (event) => {
      switch (event.keyCode) {
        case 27:
          if (historyOpen) {
            setHistoryOpen(false)
          } else {
            handleOpen()
          }
          break
      }
    },
    [setMenuOpen, historyOpen, textMode]
  )

  useEventListener("keydown", handler)

  useEffect(() => {
    if (!instructionsShown && cookies[COOKIE_DISCLAIMER] !== COOKIE_DISCLAIMER_HIDE) {
      dispatch(setInstructionsShown(true))
      showTutorial()
    }
  }, [])

  return (
    <div>
      <StaticDialog
        isOpen={historyOpen}
        title="Question History"
        onAfterClose={() => {
          setHistoryOpen(false)
        }}
        showCloseIcon>
        <div className="QuestionHistory" style={{ minHeight: '30vh' }}>
          {questionHistory.length === 0 ?
            'No questions asked yet' :
            questionHistory.map((turn, index) => {
              return <div className="QuestionHistory-Items" key={`item-${index}`}>
                <span key={`question-${index}`} className="QuestionHistory-Items-Question">{turn['question']}</span>
                <span key={`reply-${index}`} className="QuestionHistory-Items-Reply" title={turn['reply']}>{turn['reply']}</span>
              </div>
            })}
        </div>
      </StaticDialog>

      <Modal
        open={menuOpen}
        onClose={handleClose}>
        <div className="Modal" style={{ width: "500px", paddingTop: '48px', paddingBottom: '40px' }}>
          <h1 className="mb-6 text-bold">MENU</h1>

          <Button
            label="Continue"
            variant="text"
            color="inherit"
            className="MenuButton mb-4 text-large"
            size="large"
            onClick={handleClose}
            disableElevation
          >Continue</Button>

          <Button
            label="Instructions"
            variant="text"
            color="inherit"
            className="MenuButton mb-4 text-large"
            size="large"
            onClick={openInstructions}
            disableElevation
          >Instructions</Button>

          <Button
            label="Question history"
            variant="text"
            color="inherit"
            className="MenuButton mb-4 text-large"
            size="large"
            onClick={openHistory}
            disableElevation
          >Question history</Button>

          <Button
            label="Text mode"
            variant="text"
            color="inherit"
            className="MenuButton mb-4 text-large"
            size="large"
            onClick={toggleTextMode}
            disableElevation
          >Enable {textMode ? 'image' : 'text'} mode</Button>

          {/* <Button
            label="Enable audio"
            variant="text"
            color="inherit"
            className="MenuButton mb-4 text-large"
            size="large"
            onClick={toggleSound}
            disableElevation
            startIcon={cookies[AUDIO_ENABLED] === 'true' ? <VolumeUp /> : <VolumeOff />}
          >{cookies[AUDIO_ENABLED] === 'true' ? 'Disable' : 'Enable'} sound</Button> */}

          <Button
            label="End game"
            variant="text"
            color="inherit"
            className="MenuButton text-large btn-alert"
            size="large"
            onClick={endGame}
            disableElevation
          >Forfeit game</Button>
        </div>
      </Modal>

      {(cards === undefined || cards === null || cards.length === 0) ? ('Loading...') : (
        <div className="GameWrapper">
          <TopBar />
          <StatusBar />
          <div>
            <Board objects={cards} />
          </div>
          <ActionBar />
          <span id="BottomMessage" className="text-center text-disabled">You can press ESC to access the menu during the game. Refresh the page if nothing happens for longer than a couple minutes.</span>
        </div>
      )}
    </div>
  )
}
