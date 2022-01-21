import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { logout } from '../../actions/appActions'
import { useAuth } from '../../utils/auth'
import ErrorView from '../ErrorView'
import LoadingView from '../LoadingView'


export default function LogoutContainer() {
  const dispatch = useDispatch()
  const [logged] = useAuth();
  const currentlySending = useSelector(state => state.currentlySending)
  const errorMessage = useSelector(state => state.errorMessage)

  useEffect(() => {
    dispatch(logout())
  }, [])

  return (
    <div>
      {!logged && <Redirect to="/login" />}
      <LoadingView currentlySending={currentlySending} />
      <ErrorView message={errorMessage} />
    </div>
  )

}
