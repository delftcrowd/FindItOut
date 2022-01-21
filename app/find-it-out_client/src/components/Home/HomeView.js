import { Button, Link as MLink } from '@material-ui/core'
import React, { Fragment, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import { StaticDialog } from 'react-st-modal'
import { loadMe, loadOnlinePlayers, refreshProgress } from '../../actions/appActions'
import { setDifficulty } from '../../actions/game'
import api from '../../utils/api'
import { getAccessToken } from '../../utils/auth'
import { getRemainingTasks } from '../../utils/utils'
import ProgressMenu from '../Prolific/ProgressMenu'
import DifficultyChooser from './DifficultyChooser'

const HomeView = () => {
  const dispatch = useDispatch()
  const playerCount = useSelector(state => state.onlineCount)
  const me = useSelector(state => state.game.me)
  const progress = useSelector(state => state.progress)
  const [difficultyMenuOpen, setDifficultyMenuOpen] = useState(false)
  const [progressMenuOpen, setProgressMenuOpen] = useState(false)
  const history = useHistory()

  var [remainingTasks, taskCompletion] = getRemainingTasks(progress)

  useEffect(() => {
    dispatch(loadMe())
    // load online players immediately
    dispatch(loadOnlinePlayers())
    const refreshOnline = setInterval(() => {
      dispatch(loadOnlinePlayers())
    }, 5000)

    dispatch(refreshProgress())

    return () => {
      clearInterval(refreshOnline)
    }
  }, [])

  const startGame = () => {
    if (remainingTasks <= 0) {
      setDifficultyMenuOpen(true)
    } else {
      // if all easy are done
      if (taskCompletion['EASY'] < 3) {
        handleDiffChooser(0) // 0 is EASY
      }
      else {
        handleDiffChooser(1) // 1 is MEDIUM
      }
    }
  }

  const handlePlay = () => {
    api.get(`/api/in_game`, {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      },
      timeout: 5000
    })
      .then(data => {
        // if already i game, don't show new game selection
        if (data.data.in_game) {
          history.push('/play')
        } else {
          startGame()
        }
      })
      .catch(error => {
        toast.error('The connection with the server is a little slow. Please retry.', { id: 'connection', duration: 5000 })
      })
  }

  const handleDiffChooser = (result) => {
    setDifficultyMenuOpen(false)

    if (result !== undefined && result !== null) {
      dispatch(setDifficulty(result))
      history.push('/lobby')
    }
  }

  const handleProgress = () => {
    setProgressMenuOpen(false)
  }

  const handleOpenProgress = () => {
    dispatch(refreshProgress())
    setProgressMenuOpen(true)
  }

  return (
    <div className="MainMenu" >
      <StaticDialog
        isOpen={difficultyMenuOpen}
        title="Choose a Difficulty"
        onAfterClose={handleDiffChooser}
        showCloseIcon>
        <DifficultyChooser />
      </StaticDialog>
      <StaticDialog
        isOpen={progressMenuOpen}
        title="Task progress"
        onAfterClose={handleProgress}
        showCloseIcon>
        <ProgressMenu />
      </StaticDialog>

      <div className="MainMenu_content text-center" style={{ height: "100vh" }}>
        <div style={{ flexGrow: "2" }}></div>
        <img src="logo-big.png" alt="logo" className="AuthCard_body_logo mb-6" />
        <span className="mb-1 text-larger">Welcome {me}!</span>
        {Object.keys(progress).length !== 0 ?
          <MLink onClick={handleOpenProgress} color="inherit">You have
            {remainingTasks === 0 ? ' completed all tasks!' : <Fragment><span className="color-accent">{remainingTasks}</span> unfinished tasks.</Fragment>}
          </MLink> : null}
        <div className="mb-3"></div>
        <Button onClick={handlePlay} className="MenuButton mb-1 text-large">Start Game</Button>
        <span className="mb-3 text-small">{playerCount.waiting.reduce((a, b) => a + b, 0)} player{playerCount.waiting.reduce((a, b) => a + b, 0) === 1 ? '' : 's'} waiting. {playerCount.playing} players playing.</span>
        {/* <Link to="/howto" className="MenuButton mb-4 text-large">Instructions</Link> */}
        <Link to="/leaderboard" className="MenuButton mb-4 text-large">Leaderboard</Link>
        <div style={{ flexGrow: "1" }}></div>
        <Link to="/logout" className="MenuButton MenuButton--auth mb-4 text-large">Logout</Link>
        <div style={{ flexGrow: "2" }}></div>
        <span className="DisclaimerHome mb-2">FindItOut was designed for research purposes. <br />
          {/* Please take a couple minutes after playing the game to fill out this <Link to="/questionnaire" style={{ fontSize: "1.1em" }}>questionnaire</Link>.</span> */}
          {/* You can access the research paper <Link to={{ pathname: "http://resolver.tudelft.nl/uuid:b2645fff-49ca-4392-b5e9-3794fa9fca19" }} style={{ fontSize: "1.1em" }} target="_blank">here</Link>. */}
        </span>
        <span className="DisclaimerHome mb-2">In case of bugs, problems or recommendations, please contact <a href="mailto:A.Hu-4@student.tudelft.nl">A.Hu-4@student.tudelft.nl</a></span>
      </div>
    </div>
  )
}

export default HomeView


  // const showDifficultyDialog = async () => {
  //   const result = await CustomDialog(
  //     <DifficultyChooser currentDifficulty={difficulty} playerCount={playerCount} />,
  //     {
  //       title: 'Choose a Difficulty',
  //       showCloseIcon: true,
  //     }
  //   )

  //   if (result !== undefined && result !== null) {
  //     dispatch(setDifficulty(result))
  //     history.push('/lobby')
  //   }
  // }