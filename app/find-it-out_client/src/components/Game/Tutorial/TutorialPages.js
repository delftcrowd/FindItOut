const Page1 = (
  <div>
    <h2>FindItOut</h2>
    <p className="text-bold">Read these rules carefully, otherwise you might not be eligible to receive the reward!</p>
    <p><b>Find It Out</b> is a competitive two player game. You take turns being the <span className="RoleName">"Asker"</span> and the <span className="RoleName">"Replier"</span>.
    </p>
    <p>Each player is shown a board of multiple cards containing concepts. You can find the definition of each card by hovering over it or by long pressing on it if you're on mobile.</p>
    <p>
      One of these cards is assigned to you as your own <span className="RoleName">"IT card"</span> and it's shown at the top of your screen.<br /><br />
    </p>
    <p className='text-center text-large'>
      <b>The main objective is to guess the opponent's IT card.</b>
    </p>
    <div className="mb-4"></div>
    <p>You can press ESC to access the menu during the game.</p>
  </div>
)

const Page2 = (
  <div>
    <h2>Game flow</h2>
    <ol className="mb-2">
      <li>You are assigned randomly the role of an ASKER or REPLIER.</li>
      <li>At the start of a round, the Asker chooses one of these actions:
        <ul>
          <li><b>ASK</b>: ask a question by choosing a question type and filling in the question. <i>Go to 3.</i></li>
          <li><b>GUESS</b>: guess your opponents's IT card by choosing a card on the board and confirming. <i>Go to 7.</i></li>
        </ul>
      </li>
      <li>Replier replies YES/NO/MAYBE according to your own IT card. You can press UNCLEAR if the question is not clear.</li>
      <li>Asker flips the cards on the board that don't match the reply.</li>
      <li>Asker now selects either CONFIRM (<i>go to 6</i>) or GUESS (<i>go to 7</i>).</li>
      <li>Asker and Replier switch roles. Round end. <i>Return to 2.</i></li>
      <li>End of game. If the Asker guessed correctly, then he wins and the Replier can take a bonus guess as well. Otherwise the Replier wins.</li>
    </ol>
    {/* TODO */}
    <span>Each win will result in a bonus payment ;)</span>
    <span>Forfeited games do not count towards the task completion.</span>
  </div>
)

const Page3 = (
  <div>
    <h2>Rules</h2>
    <ol>
      <li>Try to base your questions on the concept instead of the image.</li>
      <li>Do not use the names of the cards in your questions.</li>
      <li>Reply truthfully. You may incur penalities if dishonest actions are detected.</li>
      <li>Use the "MAYBE" reply only when necessary. E.g. when it is not a clear YES/NO answer.</li>
      <li>Make sure to flip cards every round where applicable.</li>
      <li>Read through the question options carefully before asking any questions.</li>
    </ol>
  </div>
)

const Page4 = (
  <div>
    <h2>We care about your privacy, and will only store:</h2>
    <ul>
      <li>Your anonymised ID</li>
      <li>Your questionnaire answers</li>
      <li>The games you played</li>
      <li>The questions and answers</li>
      <li>The board state of each round</li>
      <li>The guesses</li>
    </ul>
  </div>
)

export default [Page1, Page2, Page3, Page4]