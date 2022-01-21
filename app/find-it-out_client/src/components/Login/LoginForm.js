import { IconButton, InputAdornment } from '@material-ui/core'
import { Visibility, VisibilityOff } from '@material-ui/icons'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '../../actions/appActions'
import ErrorView from '../ErrorView'
import MyInput from '../Input'
import LoadingView from '../LoadingView'

export default function LoginForm() {
  const currentlySending = useSelector(state => state.currentlySending);
  const errorMessage = useSelector(state => state.errorMessage);
  const changeForm = useSelector(state => state.changeForm)
  const dispatch = useDispatch();

  const submitForm = event => {
    event.preventDefault()
    dispatch(login(changeForm.username, changeForm.password))
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
      <MyInput type="text" name="username" model="username" placeholder="Username" className="text-center mb-3" autofocus />
      <MyInput id="current-password" type={showPass ? 'text' : 'password'} name="current-password" model="password"
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
      <input type="submit" value="Login" className="AuthButton btn btn-primary mb-2" />
      <LoadingView currentlySending={currentlySending} />
      <ErrorView message={errorMessage} />
    </form>
  )
}
