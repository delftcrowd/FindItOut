import React, { useState } from 'react';
import { useDialog } from 'react-st-modal';
import { COOKIE_DISCLAIMER_HIDE, COOKIE_DISCLAIMER_SHOW } from "../../../constants/AppConstants";

const Disclaimer = () => {
  const dialog = useDialog();

  const [checked, setChecked] = useState(false);

  const handleSubmit = event => {
    event.preventDefault()
    dialog.close(checked ? COOKIE_DISCLAIMER_HIDE : COOKIE_DISCLAIMER_SHOW);
  }

  return (
    <div id="Disclaimer">
      <p className="mb-2">
        FindItOut is still in early development. That means that some of the features do not work as expected.
        Currently the biggest problems are the images, as they might not be a good representation of the actual words.
        It might also happen that some images do not load.
        For these reasons, do remember that the images are only there to help you visualise the concepts, but are not totally reliable.
        <br />
        Please base your questions and answers on the words and concepts themselves instead of the shown image.
        Only in case the word is not known, not clear or ambiguous, you can use the visual elements of the cards.
        <br />
        <br />
        <span className="bolder">Thank you for playing!</span>
        <br />
        - Andy
      </p>
      <form id="disclaimerForm" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        noValidate onSubmit={handleSubmit}>
        <div>
          <input id="donotshow"
            name="donotshow"
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label htmlFor="donotshow">Do not show this again</label>
        </div>
        <button
          className="AuthButton btn btn-primary"
          type="submit"
          form="disclaimerForm"
        >
          Continue
        </button>
      </form>
    </div>
  );
}

export default React.memo(Disclaimer)