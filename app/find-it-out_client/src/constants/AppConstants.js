export const CHANGE_FORM = 'CHANGE_FORM'
export const SET_AUTH = 'SET_AUTH'
export const SENDING_REQUEST = 'SENDING_REQUEST'
export const LOADING_AUTH = 'LOADING_AUTH'
export const SET_ERROR_MESSAGE = 'SET_ERROR_MESSAGE'
export const SET_DATA = 'SET_DATA'
export const SET_ONLINE_COUNT = 'SET_ONLINE_COUNT'
export const SET_FRESH_LOGIN = 'SET_FRESH_LOGIN'
export const SET_PROGRESS = 'SET_PROGRESS'
export const SET_COMPLETED = 'SET_COMPLETED'

export const difficulties = [
  { 'id': 'easy', 'numCards': '8', 'description': 'Less cards, objects are very different, suitable for a fast game.' },
  { 'id': 'medium', 'numCards': '16', 'description': 'The normal experience, not too hard, not too easy, just about right.' },
  { 'id': 'hard', 'numCards': '24', 'description': 'Objects are more similar, gives a little more of a challenge. *This difficulty is currently not available. Stay tuned for future updates!*' },
  // { 'id': 'extreme', 'numCards': '24', 'description': 'More cards, objects are very similar, you are restricted to a subset of question types each round(still in development).' },
  { 'id': 'any', 'numCards': '8, 16 or 24', 'description': 'Match with any available room. A new game will be created with random difficulty if no rooms are available.' }]

const experience_responses = [
  { value: 0, text: "Complete Novice" },
  { value: 1, text: "Advanced beginner" },
  { value: 2, text: "Competent" },
  { value: 3, text: "Proficient" },
  { value: 4, text: "Expert" },
]

const games_responses = [
  { value: 0, text: "0 to 2" },
  { value: 1, text: "3 to 5" },
  { value: 2, text: "6 to 10" },
  { value: 3, text: "11 to 20" },
  { value: 4, text: "20+" },
]

export const responses = [
  { value: -3, text: "Strongly disagree" },
  { value: -2, text: "Disagree" },
  { value: -1, text: "Slightly disagree" },
  { value: 0, text: "Neutral" },
  { value: 1, text: "Slightly agree" },
  { value: 2, text: "Agree" },
  { value: 3, text: "Strongly agree" }
]

export const exit_questionnaire_questions = [
  { name: 'experience', question: 'My experience level in playing (digital) games.', responses: experience_responses },
  { name: 'num_games', question: "The number of (digital) games I have played in my life.", responses: games_responses },
  { name: 'MEA_1', question: 'Playing the game was meaningful to me.', responses: responses },
  { name: 'MEA_2', question: 'The game felt relevant to me.', responses: responses },
  { name: 'MEA_3', question: 'Playing this game was valuable to me.', responses: responses },
  { name: 'CUR_1', question: 'I wanted to explore how the game evolved.', responses: responses },
  { name: 'CUR_2', question: 'I wanted to find out how the game progressed.', responses: responses },
  { name: 'CUR_3', question: 'I felt eager to discover how the game continued.', responses: responses },
  { name: 'MAS_1', question: 'I felt I was good at playing this game.', responses: responses },
  { name: 'MAS_2', question: 'I felt capable while playing the game.', responses: responses },
  { name: 'MAS_3', question: 'I felt a sense of mastery playing this game.', responses: responses },
  { name: 'AUT_1', question: 'I felt free to play the game in my own way.', responses: responses },
  { name: 'AUT_2', question: 'I felt like I had choices regarding how I wanted to play this game.', responses: responses },
  { name: 'AUT_3', question: 'I felt a sense of freedom about how I wanted to play this game.', responses: responses },
  { name: 'IMM_1', question: 'I was no longer aware of my surroundings while I was playing.', responses: responses },
  { name: 'IMM_2', question: 'I was immersed in the game.', responses: responses },
  { name: 'IMM_3', question: 'I was fully focused on the game.', responses: responses },
  { name: 'PF_1', question: 'The game informed me of my progress in the game.', responses: responses },
  { name: 'PF_2', question: 'I could easily assess how I was performing in the game.', responses: responses },
  { name: 'PF_3', question: 'The game gave clear feedback on my progress towards the goals.', responses: responses },
  { name: 'AA_1', question: 'I enjoyed the way the game was styled.', responses: responses },
  { name: 'AA_2', question: 'I liked the look and feel of the game.', responses: responses },
  { name: 'AA_3', question: 'I appreciated the aesthetics of the game.', responses: responses },
  { name: 'CH_1', question: 'The game was not too easy and not too hard to play.', responses: responses },
  { name: 'CH_2', question: 'The game was challenging but not too challenging.', responses: responses },
  { name: 'CH_3', question: 'The challenges in the game were at the right level of difficulty for me.', responses: responses },
  { name: 'EC_1', question: 'It was easy to know how to perform actions in the game.', responses: responses },
  { name: 'EC_2', question: 'The actions to control the game were clear to me.', responses: responses },
  { name: 'EC_3', question: 'I thought the game was easy to control.', responses: responses },
  { name: 'GR_1', question: 'I grasped the overall goal of the game.', responses: responses },
  { name: 'GR_2', question: 'The goals of the game were clear to me.', responses: responses },
  { name: 'GR_3', question: 'I understood the objectives of the game.', responses: responses }]

export const COMPLETION_LINK = 'https://app.prolific.co/submissions/complete?cc=4AF2E57C'

export const NUM_TASKS = 5

// 0 = EASY, 1 = MEDIUM, 2 = HARD
export const MIN_QUESTIONS = { 0: 2, 1: 3, 2: 3 }

export const MAX_WORDS = 5
export const MAX_FREE_WORDS = 3

export const SET_INSTRUCTIONS_SHOWN = 'SET_INSTRUCTIONS_SHOWN'
export const SET_SESSION = 'SET_SESSION'
export const SET_DIFFICULTY = 'SET_DIFFICULTY'
export const SET_TURN = 'SET_TURN'
export const SET_ROLE = 'SET_ROLE'
export const SET_CARDS = 'SET_CARDS'
export const SET_IT_CARD = 'SET_IT_CARD'
export const SET_OPPONENT_IT_CARD = 'SET_OPPONENT_IT_CARD'
export const SET_ME = 'SET_ME'
export const SET_OPPONENT = 'SET_OPPONENT'
export const SET_RELATIONS = 'SET_RELATIONS'
export const SET_TARGET_INPUT = 'SET_TARGET_INPUT'
export const SET_TARGET_RELATION = 'SET_TARGET_RELATION'
export const SET_ASKER_ACTION = 'SET_ASKER_ACTION'
export const SET_GUESS_CARD = 'SET_GUESS_CARD'
export const SET_STAGE = 'SET_STAGE'
export const SET_QUESTION = 'SET_QUESTION'
export const SET_ANSWER = 'SET_ANSWER'
export const SET_QUESTION_HISTORY = 'SET_QUESTION_HISTORY'
export const SET_REPORT_CHECKED = 'SET_REPORT_CHECKED'
export const SET_TEXT_MODE = 'SET_TEXT_MODE'
export const SET_GAMEOVER = 'SET_GAMEOVER'
export const SET_FORFEITED = 'SET_FORFEITED'
export const SET_WON = 'SET_WON'

export const STAGE_ASKER_ASK_GUESS = 'asker_ask_guess'
export const STAGE_REPLIER_REPLY = 'replier_reply'
export const STAGE_ASKER_FLIP = 'asker_flip'
export const STAGE_BONUS = 'replier_bonus'
export const STAGE_ENDGAME = 'endgame'

export const ACTION_NONE = 'none'
export const ACTION_ASK = 'ask'
export const ACTION_GUESS = 'guess'

export const ANSWER_YES = 'YES'
export const ANSWER_NO = 'NO'
export const ANSWER_MAYBE = 'MAYBE'
export const ANSWER_UNCLEAR = 'UNCLEAR'

export const ACCESS_TOKEN_NAME = 'FINDITOUT_ACCESS'
export const REFRESH_TOKEN_NAME = 'FINDITOUT_REFRESH'

export const AUDIO_ENABLED = 'AUDIO_ENABLED'
export const COOKIE_DISCLAIMER = 'COOKIE_DISCLAIMER'
export const COOKIE_DISCLAIMER_HIDE = 'COOKIE_DISCLAIMER_HIDE'
export const COOKIE_DISCLAIMER_SHOW = 'COOKIE_DISCLAIMER_SHOW'

export const SERVER_URL = 'https://finditout.herokuapp.com'
// export const SERVER_URL = 'http://localhost:5000'
