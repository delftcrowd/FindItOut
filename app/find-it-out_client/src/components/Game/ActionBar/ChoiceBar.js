import { Button } from '@material-ui/core';
import { EmojiObjectsOutlined, QuestionAnswerOutlined } from '@material-ui/icons';
import { useDispatch, useSelector } from "react-redux";
import { setAskerAction } from "../../../actions/game";
import { ACTION_ASK, ACTION_GUESS } from "../../../constants/AppConstants";

export default function ChoiceBar() {
  const action = useSelector(state => state.game.action)
  const dispatch = useDispatch()

  const handleAsk = () => {
    dispatch(setAskerAction(ACTION_ASK))
  }
  const handleGuess = () => {
    dispatch(setAskerAction(ACTION_GUESS))
  }

  return (
    <div id="ChoiceBar">
      <Button
        id="ask"
        label="ASK"
        variant={`${action === ACTION_ASK ? "contained" : "outlined"}`}
        color={`${action === ACTION_ASK ? "secondary" : "inherit"}`}
        className="btn"
        size="large"
        style={{ borderRadius: "2em" }}
        onClick={handleAsk}
        startIcon={<QuestionAnswerOutlined />}
        disableElevation
      >ASK</Button>

      <Button
        id="guess"
        label="GUESS"
        variant={`${action === ACTION_GUESS ? "contained" : "outlined"}`}
        color={`${action === ACTION_GUESS ? "secondary" : "inherit"}`}
        className="btn"
        size="large"
        name="guess"
        style={{ borderRadius: "2em" }}
        onClick={handleGuess}
        startIcon={<EmojiObjectsOutlined />}
        disableElevation
      >GUESS</Button>
    </div >
  )

}