import { Button, Checkbox, FormControlLabel, MobileStepper } from '@material-ui/core';
import { KeyboardArrowLeft, KeyboardArrowRight, SkipNext } from '@material-ui/icons';
import React, { useState } from 'react';
import { useDialog } from 'react-st-modal';
import { COOKIE_DISCLAIMER_HIDE, COOKIE_DISCLAIMER_SHOW } from "../../../constants/AppConstants";
import TutorialPages from './TutorialPages';


const Tutorial = ({ original = false }) => {
  const dialog = useDialog();

  const [checked, setChecked] = useState(original);

  const toggleChecked = (event) => {
    setChecked(event.target.checked)
  }

  const [activeStep, setActiveStep] = React.useState(0);

  const pages = [...TutorialPages, (
    <div id="Disclaimer">
      <h2>Disclaimer</h2>
      <p className="mb-2">
        FindItOut is still in early development. The images shown on the cards might not be a good representation of the actual concepts.
        It might also happen that some images do not load. For these reasons, do remember that the images are only there to help you visualise the concepts, but are not totally reliable.
        <br />
        Please base your questions and answers on the words and concepts themselves instead of the shown image.
        Only in case the word is not known, not clear or ambiguous, you can use the visual elements of the cards.
        <br />
        <br />
        <span className="bolder">Thank you for playing! Remember to wear your masks! Stay safe.</span>
        <br />
        - Andy
      </p>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={toggleChecked}
            name="donotshow"
          />
        }
        label="Do not show the tutorial again"
      />
    </div>)]

  const handleNext = () => {
    if (activeStep === pages.length - 1) { // last page
      dialog.close(checked ? COOKIE_DISCLAIMER_HIDE : COOKIE_DISCLAIMER_SHOW);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0) {
      setActiveStep(pages.length - 1)
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };


  return (
    <div id="Tutorial">
      <div style={{ padding: '1em' }}>{pages[activeStep]}</div>

      <MobileStepper
        variant="text"
        steps={pages.length}
        position="static"
        activeStep={activeStep}
        backButton={
          <Button size="small" onClick={handleBack} style={activeStep === 0 ? { color: '#D95D39', borderColor: '#D95D39' } : {}}>
            {activeStep === 0 ? <SkipNext /> : <KeyboardArrowLeft />}
            {activeStep === 0 ? 'Skip' : 'Back'}
          </Button>
        }
        nextButton={
          <Button size="small" onClick={handleNext}>
            {activeStep === pages.length - 1 ? 'Back to game' : 'Next'}
            <KeyboardArrowRight />
          </Button>
        }
      />
    </div>
  );
}

export default React.memo(Tutorial)
