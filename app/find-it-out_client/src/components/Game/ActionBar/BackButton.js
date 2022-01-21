import React from "react"
import { Button } from "@material-ui/core"
import { ACTION_NONE } from "../../../constants/AppConstants"
import { setAskerAction, setGuessCard, setQuestion, setTargetRelation } from "../../../actions/game"
import { useDispatch } from "react-redux"

const BackButton = () => {
  const dispatch = useDispatch()

  const handleBack = () => {
    dispatch(setGuessCard(-1))
    dispatch(setTargetRelation(-1))
    dispatch(setAskerAction(ACTION_NONE))
  }

  return (<Button
    label="Back"
    color="secondary"
    variant="filled"
    size="large"
    className="BigButton BackButton"
    onClick={handleBack}
    disableElevation
  >BACK</Button>)
}

export default React.memo(BackButton)