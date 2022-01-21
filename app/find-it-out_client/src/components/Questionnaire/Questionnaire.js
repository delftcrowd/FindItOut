import { Link } from 'react-router-dom'

export default function Questionnaire() {



  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", alignItems: "center" }}>
      <Link to="/" className="AuthButton btn btn-primary mb-2" style={{ padding: '1em', maxWidth: "20em", marginTop: "2em" }}>Back to main menu</Link>
      <iframe src={/*retracted*/} style={{ width: "100%", height: "100%", frameborder: "0", marginheight: "0", marginwidth: "0" }} className="mb-4">Loading…</iframe>
    </div>
  )
}