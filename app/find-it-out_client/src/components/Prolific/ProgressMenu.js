import { Button } from '@material-ui/core';
import { CheckCircle, CheckCircleOutline } from '@material-ui/icons';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { COMPLETION_LINK } from '../../constants/AppConstants';
import { CircularProgressWithLabel, clamp, getRemainingTasks, openInNewTab } from '../../utils/utils';

const ProgressMenu = () => {
  const dispatch = useDispatch()
  const progress = useSelector(state => state.progress)
  const completed = useSelector(state => state.completed)
  var [remainingTasks, _] = getRemainingTasks(progress)

  const complete = () => {
    openInNewTab(COMPLETION_LINK)
  }

  return (
    <div id="ProgressMenu">
      <CircularProgressWithLabel value={(5 - remainingTasks) * 20} />
      <div className="mb-2"></div>

      <div className="ProgressMenu-Table mb-4">
        <span className="ProgressMenu-Table_progress">{progress['EASY'] >= 3 ? <CheckCircle color="secondary" /> : <CheckCircleOutline className="text-disabled ProgressMenu-Table_icon" />}
          {clamp(progress['EASY'], 0, 3)}/3</span> <span className="ProgressMenu-Table_description">Easy difficulty</span>
        <span className="ProgressMenu-Table_progress">{progress['MEDIUM'] >= 2 ? <CheckCircle color="secondary" /> : <CheckCircleOutline className="text-disabled ProgressMenu-Table_icon" />}
          {clamp(progress['MEDIUM'], 0, 2)}/2</span> <span>Medium difficulty</span>
        {/* <span className="ProgressMenu-Table_progress">{progress['HARD'] >= 2 ? <CheckCircle color="secondary" /> : <CheckCircleOutline className="text-disabled ProgressMenu-Table_icon" />}
          {clamp(progress['HARD'], 0, 1)}/2 </span> <span>Hard difficulty</span> */}
      </div>
      {completed ? <Button onClick={complete} className="MenuButton mb-4 text-large">Complete study</Button> :
        remainingTasks === 0 ? <Link to="/exit_questionnaire" className="MenuButton mb-4 text-large">Proceed to ending questionnaire</Link> : null}
      <span className="text-small">It might take a minute to update the progress. Tap outside and reopen this window to refresh.<br />Once you complete the tasks you will be given a link to proceed forward and complete the study.</span>
    </div>
  );
}

export default React.memo(ProgressMenu)