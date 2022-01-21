import { useSelector } from "react-redux";

const StatusBar = () => {
  const role = useSelector(state => state.game.role)
  const myTurn = useSelector(state => state.game.myTurn)

  return (
    <div className="StatusBar">
      <div className="PlayerRole text-xlarge">You are the <b className="color-accent">{role}</b></div>
    </div>
  )

}

export default StatusBar;