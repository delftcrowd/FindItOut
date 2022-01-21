import { useHistory } from 'react-router'

export default function Leaderboard() {
  const history = useHistory()

  const redirectToHome = () => {
    history.push('/')
  }

  return (
    <div className="MainContainer">
      <div className="MainContainer_content">
        <span className="text-larger mb-4">Feature still in development.</span><br />
        <span className="mb-8">Stay tuned for the next update!</span><br />
        <a className="AuthButton btn btn-primary" style={{ padding: '1em' }} onClick={redirectToHome}>Back to main menu</a>
      </div>
    </div>)
}