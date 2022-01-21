import { IconButton, InputAdornment } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { Alert } from 'react-st-modal'
import { register } from '../../actions/appActions'
import ErrorView from '../ErrorView'
import MyInput from '../Input'
import LoadingView from '../LoadingView'

const RegisterForm = () => {
  const currentlySending = useSelector(state => state.currentlySending)
  const errorMessage = useSelector(state => state.errorMessage)
  const changeForm = useSelector(state => state.changeForm)
  const dispatch = useDispatch()
  const location = useLocation()
  const with_pid = !(location.state === undefined || location.state.pid === undefined || location.state.pid === null || location.state.pid === "")

  useEffect(() => {
    // If we come from the prolific entry
    if (with_pid) {
      Alert(<div><h1>Welcome dear Prolific user!</h1> <p><b>Thank you for joining our research about Games With A Purpose!</b><br /><br />You can register with a username of your liking and use it to access the game even after your tasks are complete. Please make sure you remember or save your password, since it is currently <b>not possible to reset the password</b>. <br />
        <b>Play honestly: if we detect any cheating behaviour, your submission will be rejected and you will not receive any rewards. For every game that you win, you will also receive a bonus of 0.15£!</b>
      </p> </div>, 'Prolific disclaimer').then(() => { })
    }
  }, [])

  const submitForm = event => {
    event.preventDefault()
    if (with_pid) {
      dispatch(register(changeForm.username, changeForm.password, location.state.pid))
    } else {
      dispatch(register(changeForm.username, changeForm.password))
    }
  }

  const [showPass, setShowPass] = useState(false);

  const handleClickShowPassword = () => {
    setShowPass(!showPass);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <form onSubmit={submitForm}>
      {/* {with_pid ? <div className="mb-2">Registering with prolific id {location.state.pid}</div> : ''} */}
      <MyInput id="username" type="text" name="username" model="username" placeholder="Username" className="text-center mb-3" autofocus />
      <MyInput id="new-password" type={showPass ? 'text' : 'password'} name="new-password" model="password"
        placeholder="Password" className="mb-3" endAdornment={
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleClickShowPassword}
              onMouseDown={handleMouseDownPassword}>
              {showPass ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          </InputAdornment>
        } />
      <input type="submit" value="Register" className="AuthButton btn btn-primary mb-2" />
      <LoadingView currentlySending={currentlySending} />
      <ErrorView message={errorMessage} />
    </form>
  )
}

export default RegisterForm
