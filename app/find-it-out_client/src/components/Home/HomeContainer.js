import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { setFreshLogin } from '../../actions/session';
import { useAuth } from '../../utils/auth';
import HomeView from '../Home/HomeView';

export default function HomeContainer() {
  const [logged] = useAuth()
  const dispatch = useDispatch()
  const isFreshLogin = useSelector(state => state.freshLogin)

  useEffect(() => {
    if (isFreshLogin) {
      console.log('New login, refreshing and clearing caches...')
      dispatch(setFreshLogin(false))
      window.location.reload(true);
    }
  }, [])

  return (
    <div>
      {!logged ? (
        <Redirect to="/login" />
      ) : (
        <HomeView />
      )}
    </div>
  )
}
