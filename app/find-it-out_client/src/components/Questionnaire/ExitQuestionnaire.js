import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select, Step, StepLabel, Stepper, TextField } from '@material-ui/core'
import { Fragment, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Likert from 'react-likert-scale'
import { useHistory } from 'react-router'
import SwipeableViews from 'react-swipeable-views'
import { COMPLETION_LINK, exit_questionnaire_questions, responses } from '../../constants/AppConstants'
import api from '../../utils/api'
import { getAccessToken } from '../../utils/auth'
import { openInNewTab, randomInt, shuffleArray } from '../../utils/utils'

export default function ExitQuestionnaire() {
  const questions = useRef([exit_questionnaire_questions[0], exit_questionnaire_questions[1], ...shuffleArray(exit_questionnaire_questions.slice(2))]).current

  const [inputValues, setInputValues] = useState({})
  const [gender, setGender] = useState('')
  const [noticeMenuOpen, setNoticeMenuOpen] = useState(false)

  const [step, setStep] = useState(0)
  const history = useHistory()

  const attentionCheck = useRef([randomInt(0, 7), randomInt(0, 7), randomInt(0, 7)]).current

  const checkAttentionCheck = (value, questionIndex) => {
    return value == responses[attentionCheck[questionIndex]].value
  }

  const handleNext = () => {
    if (step < 2) {
      setStep((prevActiveStep) => prevActiveStep + 1)
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }
  }

  const handleBack = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
    setStep((prevActiveStep) => prevActiveStep - 1)
  }

  const handleInputChange = (name, value) => {
    setInputValues((prev) => {
      return {
        ...prev,
        [name]: value,
      }
    });
  }

  const handleNoticeMenu = () => {
    setNoticeMenuOpen(false)
  }

  const handleComplete = () => {
    openInNewTab(COMPLETION_LINK)
    history.replace('/')
  }

  const handleBackToHome = () => {
    history.replace('/')
  }

  const handleSubmit = event => {
    event.preventDefault()

    const allAttentionCheckDone = event.target['AC-0'].value.length > 0 && event.target['AC-1'].value.length > 0 && event.target['AC-2'].value.length > 0

    if (allAttentionCheckDone && gender.length > 0 && questions.length + 3 === Object.keys(inputValues).length) {
      const validResponse = checkAttentionCheck(event.target['AC-0'].value, 0)
        && checkAttentionCheck(event.target['AC-1'].value, 1)
        && checkAttentionCheck(event.target['AC-2'].value, 2)
      api.post(`/api/exit_questionnaire`,
        {
          'results': {
            birth_year: event.target.birth_year.value,
            gender: gender,
            feedback: event.target.feedback.value,
            valid: validResponse,
            ...inputValues
          }
        }, { headers: { 'Authorization': `Bearer ${getAccessToken()}` } })
        .then(data => {
          if (data.data.success) {
            setNoticeMenuOpen(true)
          } else {
            throw 'error'
          }
        }).catch(error => toast.error('Already submitted. Cannot submit anymore!', { id: 'error' }))
    } else {
      toast.error('Not all questions were answered! Please fill in all questions.', { id: 'error' })
    }
  }

  const renderQuestions = (qs) => {
    return qs.map(question => {
      return <Likert required id={question.name} key={question.name} name={question.name} question={question.question} responses={question.responses} onChange={val => handleInputChange(question.name, val.value)} layout="stacked" />
    })
  }

  const renderAttentionCheck = (index) => {
    const id = `AC-${index}`
    return <Likert required id={id} name={id} question={`Please select the option "${responses[attentionCheck[index]].text}"`} responses={responses} onChange={val => handleInputChange(id, val.value)} layout="stacked" />
  }

  return <Fragment>
    <Dialog
      open={noticeMenuOpen}
      onClose={handleNoticeMenu}
      aria-labelledby="completion notice">
      <DialogTitle>Congratulations! You have completed all tasks!</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          You can press "<b>Complete study</b>" to be redirected to the completion link. <br />
          But before we finish...You have unlocked all difficulties! You are now free to continue playing for as long as you want, even after you have completed the study. By doing so, you will be contributing to the major cause of common sense collection for the betterment of human-like AI.<br />
          Don't worry! The completion link will always be present in the homescreen, which you can access anytime. You will be paid for the time spent on completing the tasks and the questionnaire.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleBackToHome} color="primary">
          Continue playing
        </Button>
        <Button onClick={handleComplete} color="primary" autoFocus>
          Complete study
        </Button>
      </DialogActions>
    </Dialog>
    <div className="ExitQuestionnaire">
      <form id="ExitQuestionnaireForm" onSubmit={handleSubmit}>
        <h1>Completion questionnaire</h1>
        <span >Thank you for completing all tasks! To conclude, please fill out this last questionnaire and answer all questions honestly.</span>
        <span className="mb-2">Your answers will be collected anonymously. This questionnaire should take about 3 minutes.</span>

        <Stepper activeStep={step}>
          <Step key={0}><StepLabel></StepLabel></Step>
          <Step key={1}><StepLabel></StepLabel></Step>
          <Step key={2}><StepLabel></StepLabel></Step>
        </Stepper>
        <SwipeableViews index={step} disabled animateHeight style={{ width: "100%" }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly', width: '100%', alignItems: 'baseline', overflow: 'auto' }} className="mb-4">
              <TextField
                label="Birth year"
                name="birth_year"
                type="number"
                variant="standard"
                size="small"
                style={{ minWidth: "6ch" }}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  min: 1900,
                  max: 2021,
                }}
              />

              <FormControl>
                <InputLabel htmlFor="gender-input">Gender</InputLabel>
                <Select
                  labelId="gender"
                  name="gender"
                  value={gender}
                  onChange={event => { setGender(event.target.value) }}
                  style={{ minWidth: '18ch' }}
                  variant="standard"
                  size="small"
                  required
                  id="gender-input"
                >
                  <MenuItem value='m'>Male</MenuItem>
                  <MenuItem value='f'>Female</MenuItem>
                  <MenuItem value='b'>Non-binary</MenuItem>
                  <MenuItem value='n'>Prefer not to say</MenuItem>
                  <MenuItem value='o'>Others</MenuItem>
                </Select>
              </FormControl>
            </div>
            {renderQuestions(questions.slice(0, 5))}
            {renderAttentionCheck(0)}
            {renderQuestions(questions.slice(5, 8))}
          </div>
          <div>
            {renderQuestions(questions.slice(8, 15))}
            {renderAttentionCheck(1)}
            {renderQuestions(questions.slice(15, 20))}
          </div>
          <div>
            {renderQuestions(questions.slice(20, 23))}
            {renderAttentionCheck(2)}
            {renderQuestions(questions.slice(23))}
            <TextField
              label="Do you have any comments or recommendations? This can be anything about the game, difficulty, enjoyability, or any other remark."
              placeholder="Type here..."
              name="feedback"
              multiline
              fullWidth
              minRows={3}
            />
          </div>
        </SwipeableViews>
        <div style={{ display: "flex", justifyContent: "space-evenly", width: "100%" }}>
          <Button
            disabled={step === 0}
            onClick={handleBack}
          >
            Back
          </Button>
          {step === 2 ?
            <Button
              label="Submit"
              color="secondary"
              variant="contained"
              type="submit"
              form="ExitQuestionnaireForm"
              id="targetSubmit"
              disableElevation>
              Submit
            </Button> :
            <Button
              label="Next"
              color="secondary"
              variant="contained"
              disableElevation
              onClick={handleNext}>
              Next
            </Button>}
        </div>
      </form>
    </div >
  </Fragment>
}