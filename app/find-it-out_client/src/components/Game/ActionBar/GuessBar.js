
import { Button } from '@material-ui/core';
import React, { Fragment, useContext } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { MIN_QUESTIONS, STAGE_ASKER_FLIP, STAGE_BONUS } from '../../../constants/AppConstants';
import { removeUnderscore, simplifyBoard } from '../../../utils/utils';
import { SocketContext } from '../../../utils/WebSocketProvider';
import BackButton from './BackButton';

export default function GuessBar() {
  const cards = useSelector(state => state.game.cards)
  const guess = useSelector(state => state.game.guess)
  const stage = useSelector(state => state.game.stage)
  const questionHistory = useSelector(state => state.game.questionHistory)
  const difficulty = useSelector(state => state.gameDifficulty)
  const disabled = (stage !== STAGE_BONUS) && ((questionHistory.length + (stage === STAGE_ASKER_FLIP)) < MIN_QUESTIONS[difficulty])

  const socket = useContext(SocketContext)

  const handleSubmit = (event) => {
    event.preventDefault()
    if (guess.length === 0) {
      toast.error('Please choose a card!', { id: 'error' })
      return false
    }

    socket.emit('make_guess', { guess_card: cards[guess].id, board: stage === STAGE_ASKER_FLIP ? simplifyBoard(cards) : [] })
  }

  return (
    <Fragment>
      <form noValidate autoComplete="off" id="guessForm" onSubmit={handleSubmit}>
        {(disabled) ?
          <span id="guessText text-italic color-grey"><i className="text-disabled">You need to ask at least {MIN_QUESTIONS[difficulty]} questions before guessing. Please go back.</i></span> :
          (guess === -1) ?
            <span id="guessText text-italic color-grey"><i className="text-disabled">Choose a card from the board...</i></span> :
            <Fragment>
              <span id="guessText">You've chosen</span>
              <span id="guessName">{removeUnderscore(cards[guess].id)}</span>
              <Button
                label="Submit"
                color="secondary"
                variant="contained"
                type="submit"
                form="guessForm"
                id="guessSubmit"
                disabled={disabled}
                disableElevation
              >Confirm</Button>
            </Fragment>
        }
      </form>
      <BackButton />
    </Fragment>
  )
}