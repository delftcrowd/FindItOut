import React, { useContext, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { SocketContext } from '../../utils/WebSocketProvider'
import { withTimeout } from '../../utils/utils'
import GameoverView from './GameoverView'
import GameView from './GameView'

const PlayContainer = () => {
  const socket = useContext(SocketContext)
  const gameover = useSelector(state => state.game.gameover)
  const history = useHistory()

  useEffect(() => {
    if (!socket.connected) {
      socket.connect()
    }

    // check if we have all the items, otherwise go back to lobby
    socket.emit('in_active_game', (in_active_game) => {
      if (!in_active_game) {
        history.push('/lobby')
      } else {
        socket.emit('get_whole_game', withTimeout(() => { }, () => { toast.error(`Request timed out! There might be an server-side error. Please contact the developer and refresh.`) }, 5000))
      }
    })
  }, [])

  return (
    <div>
      {gameover ? <GameoverView /> : <GameView />}
    </div>
  )
}

export default React.memo(PlayContainer)
