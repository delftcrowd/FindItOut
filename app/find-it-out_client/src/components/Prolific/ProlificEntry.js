import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { useHistory } from "react-router"
import { changeForm } from "../../actions/appActions"
import api from "../../utils/api"
import { useQuery } from "../../utils/utils"

export default function ProlificEntry() {
  const query = useQuery()
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    const pid = query.get("PROLIFIC_PID")

    if (pid === undefined || pid === null || pid === "") {
      history.replace('/register')
    } else {
      api.get('/api/is_registered', {
        params: {
          pid: pid
        }
      })
        .then(data => {
          // if already in game, don't show new game selection
          console.log(data.data)
          if (data.data.is_registered) {
            // proceed to main menu or login
            dispatch(changeForm({ username: data.data.username }))
            history.replace('/login', { pid: pid })
          } else {
            // proceed to registration screen
            // dispatch(changeForm({ username:  }))
            history.replace('/register', { pid: pid })
          }
        })
    }

  }, [])

  return (<div></div>)
}