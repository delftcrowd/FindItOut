
import { Button, FormControl, FormHelperText, Input, InputLabel, MenuItem, TextField } from '@material-ui/core';
import React, { Fragment, useCallback, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { CustomDialog } from 'react-st-modal';
import { Typo } from "typo-js-ts";
import { setAskerAction, setGuessCard, setTargetInput, setTargetRelation } from '../../../actions/game';
import { ACTION_NONE, MAX_WORDS } from '../../../constants/AppConstants';
import { SocketContext } from '../../../utils/WebSocketProvider';
import BackButton from './BackButton';
import SpellCheck from './SpellCheck';

const RelationBar = () => {
  const relations = useSelector(state => state.game.relations);
  const targetIndex = useSelector(state => state.game.target.index)
  const targetValue = useSelector(state => state.game.target.value)
  const cards = useSelector(state => state.game.cards)
  const dispatch = useDispatch()
  var dict = new Typo("en_US", null, null, {
    dictionaryPath: `${window.location.protocol}//${window.location.host}/typo/dictionaries`
  });
  const tabooWords = cards.map(card => card['id'])

  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const socket = useContext(SocketContext)

  const relationChoices = relations.map((relation, index) => (
    <MenuItem key={relation.name} value={index} dense>
      {relation.name}
    </MenuItem>
  ))

  const handleRelation = (event) => {
    // target.value = '';
    dispatch(setTargetRelation(event.target.value));
  };

  const validate = (text) => {
    const validChars = /^[0-9a-zA-Z '-/]*$/;
    // check if have illegal characters
    if (!validChars.test(text)) {
      setErrorMsg('Alphanumeric characters only');
      return false
    }
    // check if have more than MAX_WORDS words
    let words = text.split(' ').filter(Boolean);
    if (words.length > MAX_WORDS) {
      setErrorMsg(`Max ${MAX_WORDS} words`)
      return false
    }

    // TODO split double words

    let taboo = words.some((word => tabooWords.some(tWord => word.toLowerCase().includes(tWord.toLowerCase()))))
    if (taboo) {
      setErrorMsg(`Card words are not allowed`)
      return false
    }

    // TODO check free words

    return true;
  }

  const spellCheck = (text) => {
    return dict.ready.then(async () => {
      const tokens = text.split(/[ '-/\(\)]+/).filter(Boolean)
      var mistakes = []
      for (const token of tokens) {
        if (!dict.check(token)) {
          mistakes.push({ 'word': token, 'recommendations': dict.suggest(token, 3) })
        }
      }

      if (mistakes.length === 0) {
        return Promise.resolve(true)
      }
      return Promise.resolve(await showSpellCheckDialog(mistakes))
    }).catch((error) => {
      console.log(error)
      // if dictionary is not yet loaded, then proceed without checking
      return Promise.resolve(true)
    });
  }

  const showSpellCheckDialog = async (mistakes) => {
    const result = await CustomDialog(
      <SpellCheck mistakes={mistakes} />,
      {
        title: 'Spelling mistakes found',
        showCloseIcon: true,
      }
    )
    return Promise.resolve(result)
  }

  const handleTarget = ({ target: { name, value } }) => {
    dispatch(setTargetInput(value))
    if (validate(value)) {
      setError(false)
      setErrorMsg('')
    } else {
      setError(true)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (targetIndex === -1) {
      setErrorMsg('Question type not selected');
      return false;
    }
    if (targetValue.length === 0) {
      setErrorMsg('Cannot be empty');
      return false;
    }
    if (validate(targetValue)) {
      const result = await spellCheck(targetValue)
      // TODO possible bug here where the window does not show up. Maybe skip if undefined
      if (result) {
        socket.emit('send_question',
          { question_type: relations[targetIndex].name, target: targetValue },
          ({ ack, msg }) => {
            if (ack) {
              dispatch(setTargetInput(''))
              dispatch(setGuessCard(-1))
              dispatch(setTargetRelation(-1))
              dispatch(setAskerAction(ACTION_NONE))
              toast.success(msg)
            } else {
              toast.error(msg, { id: 'error' })
            }
          }
        )
      }
    }
  }

  const getQuestion = index => {
    if (index === -1) {
      return "Please choose a question type..."
    }
    return relations[targetIndex].question
  }

  return (
    (relations === undefined || relations === null || relations.length === 0) ? ('Loading...') : (
      <Fragment>
        <form noValidate autoComplete="off" id="askForm" onSubmit={handleSubmit}>
          <TextField
            margin="dense"
            id="relation"
            select
            label="Question type"
            color="secondary"
            value={targetIndex}
            onChange={handleRelation}
            variant="outlined"
            size="small"
            style={{ minWidth: '14ch' }}
          >

            {targetIndex === -1 ? <MenuItem disabled value={-1} dense>
              <em className="text-disabled">Chooose...</em>
            </MenuItem> : ''}
            {relationChoices}
          </TextField>

          <div id="targetQuestion">
            <span className={targetIndex === -1 ? 'text-disabled mt-2' : ''}>{getQuestion(targetIndex)}</span>
            {targetIndex !== -1 ? <Fragment>
              <FormControl>
                <InputLabel htmlFor="component-simple" margin='dense' shrink color="secondary">Max {MAX_WORDS} words</InputLabel>
                <Input error={error} id="target-input" value={targetValue} onChange={handleTarget} placeholder="" aria-describedby="component-error-text" margin="dense" autoCapitalize='none' color="secondary" required />
                <FormHelperText id="component-error-text" error color="secondary">{errorMsg}</FormHelperText>
              </FormControl>
              <span>?</span></Fragment> : ''}
          </div>

          {targetIndex !== -1 ? <Button
            label="Submit"
            color="secondary"
            variant="contained"
            onClick={handleSubmit}
            type="submit"        //set the buttom type is submit
            form="askForm"        //target the form which you want to sent 
            id="targetSubmit"
            disableElevation
          >SEND</Button> : ''}
        </form>
        <BackButton />
      </Fragment>
    )
  )
}

export default React.memo(RelationBar)