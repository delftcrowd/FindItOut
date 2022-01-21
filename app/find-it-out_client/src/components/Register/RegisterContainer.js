import React from 'react'
import { useSelector } from 'react-redux'
import { Redirect, Link } from 'react-router-dom'
import { useAuth } from '../../utils/auth';
import RegisterForm from './RegisterForm'


export default function RegisterContainer() {
  const [logged] = useAuth();

  return (
    <div>
      {logged ? (
        <Redirect to="/" />
      ) : (
        <div className="AuthWrapper">
          <div className="AuthWrapper_content">
            <div className="AuthCard">
              <div className="AuthCard_body text-center">
                <img src="logo-big.png" alt="logo" className="AuthCard_body_logo mb-3" />
                <h1 className="mb-3 text-xlarge">Register</h1>
                <span className="text-important">Please remember your login info!</span>
                <br />
                <span className="text-muted text-small">You won't be able to reset nor retrieve the password.</span>
                <br />
                <br />
                <RegisterForm />
                <br />
                <br />
                <p>
                  Already have an account? <Link to="/login">Login</Link>
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
