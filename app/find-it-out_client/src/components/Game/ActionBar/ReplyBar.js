import { Button, ButtonGroup } from '@material-ui/core'
import { Fragment, useContext } from "react"
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from "react-redux"
import { setAnswer } from "../../../actions/game"
import { ANSWER_NO, ANSWER_MAYBE, ANSWER_YES, ANSWER_UNCLEAR } from '../../../constants/AppConstants'
import { SocketContext } from "../../../utils/WebSocketProvider"


export default function ReplyBar() {
  const answer = useSelector(state => state.game.answer)
  const question = useSelector(state => state.game.question)

  const socket = useContext(SocketContext)
  const dispatch = useDispatch()

  const handleAnswer = (event, answer) => {
    if (answer !== null) {
      dispatch(setAnswer(answer))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (answer === '') {
      toast.error('Please select an answer.')
      return false
    }

    socket.emit('reply_question', answer, ({ ack, msg }) => {
      if (ack) {
        toast.success(msg)
      } else {
        toast.error(msg, { id: 'error' })
      }
    })

    dispatch(setAnswer(''))
  }

  const handleUnclear = () => {
    socket.emit('reply_question', ANSWER_UNCLEAR, ({ ack, msg }) => {
      if (ack) {
        toast.success(msg)
      } else {
        toast.error(msg, { id: 'error' })
      }
    })
  }

  const setSelectedBtn = (answer) => {
    dispatch(setAnswer(answer))
  }

  return (
    <Fragment>
      <form noValidate autoComplete="off" id="answerForm" onSubmit={handleSubmit}>
        <span className="text-larger">{question}</span>

        <ButtonGroup
          value={`${answer}`}
          onChange={handleAnswer}
          aria-label="Question reply"
          size="medium"
          color="secondary"
          disableElevation
        >
          <Button key="yes" onClick={() => setSelectedBtn(ANSWER_YES)} variant={answer === ANSWER_YES ? "contained" : "outlined"}>YES</Button>,
          <Button key="no" onClick={() => setSelectedBtn(ANSWER_NO)} variant={answer === ANSWER_NO ? "contained" : "outlined"}>NO</Button>,
          <Button key="maybe" onClick={() => setSelectedBtn(ANSWER_MAYBE)} variant={answer === ANSWER_MAYBE ? "contained" : "outlined"}>MAYBE</Button>,
        </ButtonGroup>

        <Button
          label="Submit"
          color="secondary"
          variant="contained"
          type="submit"
          form="answerForm"
          id="answerSubmit"
          disableElevation
        >SEND</Button>
      </form >
      <Button
        label="Unclear"
        color="secondary"
        variant="filled"
        size="large"
        className="BigButton BackButton"
        onClick={handleUnclear}
        disableElevation
      >UNCLEAR</Button>
    </Fragment>
  )

}