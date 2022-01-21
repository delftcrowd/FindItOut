import Tooltip from '@material-ui/core/Tooltip'
import Image from 'material-ui-image'
import React, { Fragment } from 'react'
import ReactCardFlip from 'react-card-flip'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { Textfit } from 'react-textfit'
import useSound from 'use-sound'
import { flipCard, setGuessCard } from '../../../actions/game'
import { ACTION_GUESS, ACTION_NONE, STAGE_ASKER_ASK_GUESS, STAGE_ASKER_FLIP, STAGE_BONUS } from '../../../constants/AppConstants'
import { capitalize } from '../../../utils/utils'
import cardFlipSound from '../../../audio/f4ngy_card_flip.wav'
import useCustomSound from '../../../utils/useCustomSound'

function Card({ imageLink, name, definitions, index, unflippable, showName, gameover, className, ...props }) {
  const card = useSelector(state => state.game.cards[index])
  const isTurn = useSelector(state => state.game.myTurn)
  const stage = useSelector(state => state.game.stage)
  const action = useSelector(state => state.game.action)
  const guess = useSelector(state => state.game.guess)
  const textMode = useSelector(state => state.game.textMode)

  const formattedName = capitalize(name.replaceAll('_', ' '))

  const dispatch = useDispatch()
  const playFlip = useCustomSound(cardFlipSound, 0.4)

  const defDiv = (
    <div className="Definitions">
      <span className="Definitions-Title">{name.replaceAll('_', ' ')}</span>
      <ol className="Definitions-List">
        {definitions && definitions.map((definition, index) => (<li key={index}>{capitalize(definition)}</li>))}
      </ol>
    </div>)

  // Flips the card on click to reveal the answer
  const handleClick = () => {
    if (unflippable) return

    if (!isTurn) {
      toast.error('Not your turn yet', { id: 'error' })
      return
    }

    if (stage === STAGE_ASKER_FLIP && action === ACTION_NONE) {
      playFlip()
      dispatch(flipCard(index))
      return
    }

    if ((action === ACTION_GUESS && ([STAGE_ASKER_ASK_GUESS, STAGE_ASKER_FLIP].includes(stage)))
      || stage === STAGE_BONUS) {
      if (index === guess) {
        dispatch(setGuessCard(-1))
      } else {
        dispatch(setGuessCard(index))
      }
      return
    }

    toast.error('Not allowed to flip cards right now.', { id: 'error' })
  }

  return (
    <Tooltip title={defDiv} arrow>
      <div className={`CardWrapper ${((guess === index)) ? "Card-selected" : ""}${gameover ? 'Card-gameover' : ''} ${className || ''}`}>
        {(unflippable === true || (card !== undefined && card !== null)) ? (
          <Fragment>
            <ReactCardFlip isFlipped={(unflippable ? false : (card.is_flipped && (guess !== index)))} >
              <div className="Card Card_front" onClick={handleClick}>
                {textMode ?
                  <div className="Square">
                    <Textfit className="Square-Content">
                      {formattedName}
                    </Textfit>
                  </div> :
                  <Image draggable="false" src={imageLink} alt={name} animationDuration={1500} aspectRatio={(1 / 1)} color='transparent' style={{ borderRadius: '0.5rem' }} />}
              </div>
              <div className="Card Card_back" onClick={handleClick}>
                <Image draggable="false" src="mini_logo.png" alt="finditout logo icon" />
              </div>
            </ReactCardFlip>
            {(unflippable || (showName && (!textMode || card.is_flipped))) &&
              <span className="Card_caption">{formattedName}</span>
            }
          </Fragment>
        ) : 'Loading card'}
      </div>
    </Tooltip>
  )
}

export default React.memo(Card)