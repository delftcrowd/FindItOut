import { Link } from "react-router-dom";

export default function Instructions() {

  return (
    <div className="MainContainer">
      <div className="MainContainer_content">
        <img src="logo-big.png" alt="logo" className="AuthCard_body_logo mb-4" style={{ maxWidth: "460px" }} />

        <p><b>Find It Out</b> is a competitive two player game, who are matched randomly and take turns being the <span className="RoleName">"Asker"</span> and the <span className="RoleName">"Replier"</span>.<br />
          At the start of the game, both players are presented with a board of multiple cards, containing pictures of various objects. The game assigns one of these cards to each player as their <span className="RoleName">"IT card"</span>, which is shown at the top of the game screen.<br />
          <span className="bolder">The main goal of each player is to guess the opponent's <span className="RoleName">IT card</span> by asking questions and reducing the options by flipping around the cards on their deck.</span></p>

        <h2>Game flow</h2>
        <p>1. <span className="RoleName">Asker</span> chooses an action between "ASK" and "GUESS":<br />
          • <b>ASK</b>: choose a question type and fill in the question, then send the question. Proceed to 2.<br />
          • <b>GUESS</b>: choose a card on the board and confirm. This will end the game.<br />
          2. <span className="RoleName">Replier</span> receives the question and replies according to his <span className="RoleName">IT card</span>.<br />
          3. <span className="RoleName">Asker</span> receives the answer and flips the cards that don't match the answer. Once finished, confirm and the next turn will start.
        </p>
        <br />
        <Link to='/' className="AuthButton btn btn-primary" style={{ padding: '1em' }}>Back to main menu</Link>
      </div>
    </div>)
}