import { Button, ButtonGroup } from '@material-ui/core'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDialog } from 'react-st-modal'
import { setDifficulty } from '../../actions/game'
import { difficulties } from '../../constants/AppConstants'
import { capitalize } from '../../utils/utils'

const DifficultyChooser = () => {
  const dialog = useDialog()
  const dispatch = useDispatch()
  const playerCount = useSelector(state => state.onlineCount)
  const difficulty = useSelector(state => state.gameDifficulty)

  const handleSubmit = event => {
    event.preventDefault()
    dialog.close(difficulty)
  }

  const setSelectedBtn = (difficulty) => {
    dispatch(setDifficulty(difficulty))
  }

  return (
    <div id="DifficultyChooser">
      <form noValidate autoComplete="off" id="difficultyForm" onSubmit={handleSubmit}>
        <ButtonGroup
          aria-label="Difficulty chooser"
          size="medium"
          color="primary"
          orientation="vertical"
          style={{ gridArea: 'difficulty' }}
          disableElevation
        >
          {difficulties.map((value, index) => {
            return <Button key={value.id} id={value.id} onClick={() => setSelectedBtn(index)} variant={difficulty === index ? "contained" : "outlined"} >{value.id.toUpperCase()}</Button>
          })}
        </ButtonGroup>

        <div id="DifficultyInfo" style={{ gridArea: 'description', width: '100%', alignSelf: 'start' }}>
          <h3 className="text-larger text-bold" style={{ textAlign: 'center' }}>{capitalize(difficulties[difficulty].id)}</h3>
          <span>Number of cards: <b>{difficulties[difficulty].numCards}</b></span>
          <span>Players waiting: <b>{difficulty === difficulties.length - 1 ? playerCount.waiting.reduce((a, b) => a + b, 0) : playerCount.waiting[difficulty]}</b></span>
          <span>{difficulties[difficulty].description}</span>
        </div>

        <Button
          label="Submit"
          color="primary"
          variant="contained"
          type="submit"
          form="difficultyForm"
          id="difficultySubmit"
          disableElevation
          disabled={difficulty === 2 ? true : false}
          style={{ gridArea: 'confirm', width: '30%' }}
        >Join</Button>
      </form>
    </div>
  )
}

export default React.memo(DifficultyChooser)