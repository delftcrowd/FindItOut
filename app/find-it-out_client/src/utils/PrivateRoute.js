import { Redirect, Route } from "react-router"
import { useAuth } from "./auth"

function PrivateRoute({ children, ...rest }) {
  const [logged] = useAuth()

  return (

    <Route {...rest} render={({ location }) => {
      return logged
        ? children
        : <Redirect to={{
          pathname: '/login',
          state: { from: location }
        }} />
    }} />
  )

}

export default PrivateRoute