import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import React, { Fragment, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { refreshProgress } from "../../actions/appActions";
import { setAnswer, setAskerAction, setCards, setDifficulty, setForfeited, setGameover, setGuessCard, setItCard, setOpponent, setOpponentItCard, setQuestion, setReportChecked, setRole, setStage, setTargetInput, setTargetRelation, setTurn, setWon } from "../../actions/game";
import { setSession } from '../../actions/session';
import { ACTION_NONE } from "../../constants/AppConstants";
import { getRemainingTasks, removeUnderscore } from '../../utils/utils';
import { SocketContext } from "../../utils/WebSocketProvider";
import Card from './Card/Card';


export default function GameoverView() {
  const dispatch = useDispatch()
  const socket = useContext(SocketContext)
  const won = useSelector(state => state.game.won)
  const opponentItCard = useSelector(state => state.game.opponentItCard)
  const questionHistory = useSelector(state => state.game.questionHistory)
  const reportChecked = useSelector(state => state.game.reportChecked)
  const forfeited = useSelector(state => state.game.forfeited)
  const progress = useSelector(state => state.progress)

  var [remainingTasks, taskCompletion] = getRemainingTasks(progress)

  const [reportOpen, setReportOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    dispatch(refreshProgress())
  }, [])


  const handleToggle = (value) => () => {
    dispatch(setReportChecked(value))
  }

  const sendReport = () => {
    if (reportChecked.length !== 0) {
      socket.emit('report', reportChecked, (success) => {
        if (success) { toast.success('Report sent! Thank you for your feedback.', { id: 'success', duration: 5000 }) }
      })
      setSubmitted(true)
    }
    handleClose()
  }

  const handleClose = () => {
    setReportOpen(false)
  }

  const resetGame = () => {
    dispatch(setAskerAction(ACTION_NONE))
    dispatch(setTargetInput(''))
    dispatch(setTargetRelation(-1))
    dispatch(setGuessCard(-1))
    dispatch(setOpponent(''))
    dispatch(setSession(''))
    dispatch(setStage(''))
    dispatch(setTurn(false))
    dispatch(setRole(''))
    dispatch(setCards([]))
    dispatch(setItCard({ id: '', image_url: '' }))
    dispatch(setQuestion(''))
    dispatch(setAnswer(''))
    dispatch(setReportChecked(null))
    dispatch(setGameover(false))
    dispatch(setForfeited(false))
    dispatch(setWon(false))
    dispatch(setOpponentItCard({ id: '', image_url: '' }))
  }

  const startGame = () => {
    // if all easy tasks are done
    if (taskCompletion['EASY'] + 1 < 3) {  // +1 because the game count is not yet updated at the end of the game, so we add it manually.
      dispatch(setDifficulty(0))  // 0 is EASY
    }
    else {
      dispatch(setDifficulty(1))  // 1 is MEDIUM
    }
    handleReset()
  }

  const handleReset = () => {
    resetGame()
    socket.emit('leave')
  }

  const report = () => {
    setReportOpen(true)
  }

  return (
    <div className="MainContainer">
      <Dialog
        open={reportOpen}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <DialogTitle>{"Select the questions with wrong answer"}</DialogTitle>
        <DialogContent>
          {questionHistory.length === 0 ?
            <DialogContentText>No questions were asked</DialogContentText> :
            <List>
              {questionHistory.map((value, index) => {
                const labelId = `checkbox-list-label-${index}`

                return (
                  <ListItem key={index} role={undefined} dense button onClick={handleToggle(index)} className="QuestionHistory-Items" style={{
                    gridTemplateColumns: '2ch 1fr 5ch'
                  }}>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={reportChecked.indexOf(index) !== -1}
                        tabIndex={-1}
                        color="secondary"
                        disableRipple
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    </ListItemIcon>
                    <ListItemText id={labelId} primary={value['question']} className="QuestionHistory-Items-Question" />
                    <ListItemText primary={value['reply']} title={value['reply']} className="QuestionHistory-Items-Reply" />
                  </ListItem>
                );
              })}
            </List>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={sendReport} color="inherit" disabled={questionHistory.length === 0 ? true : false}>
            Report mistakes
          </Button>
        </DialogActions>
      </Dialog>

      <div className="MainContainer_content MainContainer_content-column" style={{ display: "flex", alignItems: "center" }}>
        <span className={`text-xxlarge mb-8 text-bold ${won ? 'color-accent' : 'color-black'}`}>{won ? "🏆✨ You won!!!" : "🥈🥺 You lost..."}</span>
        <span className="text-large mb-4">The opponent's card was <b className="color-accent">{removeUnderscore(opponentItCard.id)}</b></span>
        <Card imageLink={opponentItCard.image_url} name={opponentItCard.id} definitions={opponentItCard.definitions} unflippable gameover className="mb-2" />

        <div className="QuestionHistory mb-4" style={{ width: '60%', minWidth: '18em' }}>
          {questionHistory.length === 0 ?
            'No questions were asked' :
            <div className="QuestionHistory-Items">
              {questionHistory.map((turn, index) => {
                return <Fragment key={index}>
                  <span key={`question-${index}`} className="QuestionHistory-Items-Question">{turn['question']}</span>
                  <span key={`reply-${index}`} className="QuestionHistory-Items-Reply" title={turn['reply']}>{turn['reply']}</span>
                </Fragment>
              })}
            </div>}
        </div>

        {questionHistory.length === 0 ? null :
          <Button
            label="Report"
            variant="text"
            color="inherit"
            className="text-large mb-4"
            size="large"
            disableElevation
            disabled={submitted ? true : false}
            onClick={report}>Report mistakes</Button>}
        {remainingTasks - !forfeited < 0 ?
          <Link onClick={handleReset} to="/lobby" className="MenuButton mb-4 text-large">{won ? "Play again" : "Try again"}</Link> :
          remainingTasks - !forfeited === 0 ?
            <Link onClick={startGame} to="/exit_questionnaire" className="MenuButton mb-4 text-large">Proceed to ending questionnaire</Link> :
            <Link onClick={startGame} to="/lobby" className="MenuButton mb-4 text-large">Proceed to next task</Link>}
        <Link onClick={handleReset} to="/" className="MenuButton MenuButton--auth text-large">Back to main menu</Link>
      </div>
    </div>
  )
}
