import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import './App.scss'
import PlayContainer from './components/Game/PlayContainer'
import HomeContainer from './components/Home/HomeContainer'
import Instructions from './components/Instructions/Instructions'
import Leaderboard from './components/Leaderboard/Leaderboard'
import LobbyContainer from './components/Lobby/LobbyContainer'
import LoginContainer from './components/Login/LoginContainer'
import LogoutContainer from './components/Logout/LogoutContainer'
import ProlificEntry from './components/Prolific/ProlificEntry'
import ExitQuestionnaire from './components/Questionnaire/ExitQuestionnaire'
import Questionnaire from './components/Questionnaire/Questionnaire'
import RegisterContainer from './components/Register/RegisterContainer'
import PrivateRoute from './utils/PrivateRoute'
import WebSocketProvider from './utils/WebSocketProvider'


const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/login" component={LoginContainer} />
        <Route exact path="/register" component={RegisterContainer} />
        <Route exact path="/logout" component={LogoutContainer} />
        <Route exact path="/prolific" component={ProlificEntry} />
        <PrivateRoute exact path="/"> <HomeContainer /></PrivateRoute>
        <PrivateRoute exact path="/leaderboard"><Leaderboard /></PrivateRoute>
        <PrivateRoute exact path="/howto"><Instructions /></PrivateRoute>
        {/* <PrivateRoute exact path="/questionnaire"><Questionnaire /></PrivateRoute> */}
        <PrivateRoute exact path="/play"><WebSocketProvider><PlayContainer /></WebSocketProvider></PrivateRoute>
        <PrivateRoute exact path="/lobby"><WebSocketProvider><LobbyContainer /></WebSocketProvider></PrivateRoute>
        <PrivateRoute exact path="/exit_questionnaire"><ExitQuestionnaire /></PrivateRoute>
        <Route path='*' ><Redirect to="/" /></Route>
      </Switch>

      {/* <LoadingView currentlySending={loadingAuth} /> */}
      <Toaster toastOptions={{
        duration: 5000
      }} />
    </Router>
  )
}

export default App