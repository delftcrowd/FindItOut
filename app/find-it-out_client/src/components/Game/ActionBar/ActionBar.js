import { useSelector } from "react-redux";
import { ACTION_ASK, ACTION_GUESS, STAGE_ASKER_ASK_GUESS, STAGE_ASKER_FLIP, STAGE_BONUS, STAGE_ENDGAME, STAGE_REPLIER_REPLY } from '../../../constants/AppConstants';
import RelationBar from "./AskBar";
import ChoiceBar from "./ChoiceBar";
import FlipBar from "./FlipBar";
import GuessBar from "./GuessBar";
import ReplyBar from "./ReplyBar";

export default function ActionBar() {
  const action = useSelector(state => state.game.action)
  const myTurn = useSelector(state => state.game.myTurn)
  const stage = useSelector(state => state.game.stage)

  const renderMessage = () => {
    switch (stage) {
      case STAGE_ASKER_ASK_GUESS:
        if (myTurn) {
          switch (action) {
            case ACTION_ASK:
              return <RelationBar />
            case ACTION_GUESS:
              return <GuessBar />
            default:
              return <ChoiceBar />
          }
        } else {
          return <div className="MessageText">The opponent is choosing an action<div className="dot-flashing"></div></div>
        }

      case STAGE_REPLIER_REPLY:
        if (myTurn) {
          return <ReplyBar />
        } else {
          return <div className="MessageText">The opponent is replying<div className="dot-flashing"></div></div>
        }

      case STAGE_ASKER_FLIP:
        if (myTurn) {
          switch (action) {
            case ACTION_GUESS:
              return <GuessBar />
            default:
              return <FlipBar />
          }
        } else {
          return <div className="MessageText">The opponent is turning cards<div className="dot-flashing"></div></div>
        }

      case STAGE_BONUS:
        return <GuessBar />

      case STAGE_ENDGAME:
        // should not happen
        return "Game over"
    }
  }

  return (
    <div className="ActionPanel">
      {renderMessage()}
    </div>
  )
}