import React from "react"
import { useSelector } from "react-redux"
import Card from "./Card/Card"
import Player from "./Player/Player"

const TopBar = () => {
  const me = useSelector(state => state.game.me)
  const itCard = useSelector(state => state.game.itCard)
  const opponent = useSelector(state => state.game.opponent)

  return (<div className="TopBar mb-4 text-large">
    <Player username={me} id="Player1" />
    <Card imageLink={itCard.image_url} name={itCard.id} definitions={itCard.definitions} unflippable showName />
    <Player username={opponent} id="Player2" />
  </div>)
}

export default React.memo(TopBar)