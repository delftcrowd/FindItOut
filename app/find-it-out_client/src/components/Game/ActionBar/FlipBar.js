import { Button } from '@material-ui/core';
import { EmojiObjectsOutlined } from '@material-ui/icons';
import { Fragment, useContext, useRef } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from "react-redux";
import { Confirm } from 'react-st-modal';
import { setAnswer, setAskerAction } from '../../../actions/game';
import { ACTION_GUESS } from '../../../constants/AppConstants';
import { reduceCards, simplifyBoard } from '../../../utils/utils';
import { SocketContext } from "../../../utils/WebSocketProvider";


export default function FlipBar() {
  const cards = useSelector(state => state.game.cards)
  const answer = useSelector(state => state.game.answer)
  const question = useSelector(state => state.game.question)
  const socket = useContext(SocketContext)
  const dispatch = useDispatch()

  const originalCardState = useRef(reduceCards(cards))


  const handleGuess = () => {
    dispatch(setAskerAction(ACTION_GUESS))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (reduceCards(cards) === originalCardState.current && !await Confirm("Don't forget to flip cards every round where applicable.", 'No cards were flipped, are you sure?', 'Proceed anyway', 'Go back')) {
      return false
    }

    // Setting answer here because it wouldn't reset before
    dispatch(setAnswer(''))
    socket.emit('end_turn', simplifyBoard(cards), ({ ack, msg }) => {
      if (ack) {
        toast.success(msg)
      } else {
        toast.error(msg)
      }
    })
  }

  return (
    <Fragment>
      <form noValidate autoComplete="off" id="flipForm" onSubmit={handleSubmit}>
        <div>
          <span className="text-larger">{question}</span>
          <span className="answerText text-xlarge">{answer}</span>
        </div>
        <div>
          <span className="text-italic text-disabled text-smaller" style={{ lineHeight: 1.4 }}>Cover the cards that don't match the reply by pressing them on the board, then end the turn or make a guess. <br />Don't forget to finish flipping the cards before guessing.</span>
        </div>
        <Button
          label="Submit"
          color="secondary"
          variant="contained"
          type="submit"        //set the buttom type is submit
          form="flipForm"        //target the form which you want to sent
          id="flipSubmit"
          disableElevation
        >END TURN</Button>
      </form >

      <Button
        id="guess"
        label="GUESS"
        variant="outlined"
        color="inherit"
        className="BigButton"
        size="large"
        name="guess"
        onClick={handleGuess}
        startIcon={<EmojiObjectsOutlined />}
        disableElevation
      >GUESS</Button>
    </Fragment>
  )
}