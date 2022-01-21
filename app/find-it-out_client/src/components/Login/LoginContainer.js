import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { Link, Redirect } from 'react-router-dom'
import { setErrorMessage } from '../../actions/appActions'
import { setFreshLogin } from '../../actions/session'
import { useAuth } from '../../utils/auth'
import LoginForm from './LoginForm'


export default function LoginContainer() {
  const [logged] = useAuth();
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(setErrorMessage(''))
  }, [])

  const goToHome = () => {
    dispatch(setFreshLogin(true))
    return <Redirect to="/" />
  }

  return (
    <div>
      {logged ? (
        goToHome()
      ) : (
        <div className="AuthWrapper">
          <div className="AuthWrapper_content">
            <div className="AuthCard">
              <div className="AuthCard_body text-center">
                <img src="logo-big.png" alt="logo" className="AuthCard_body_logo mb-3" />
                <h1 className="mb-3 text-xlarge">Login</h1>
                <span className="text-muted">Insert your credentials</span>
                <br />
                <br />
                <LoginForm />
                <br />
                <br />
                <p>
                  Don't have an account? <Link to="/register">Signup</Link>
                </p>
                <br />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}