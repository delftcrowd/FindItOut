import React from 'react';
import { useDialog } from 'react-st-modal';

const SpellCheck = ({ mistakes }) => {
  const dialog = useDialog();

  const handleSubmit = result => {
    dialog.close(result);
  }

  return (
    <div id="SpellCheck">
      <div style={{ gridArea: 'text', alignSelf: 'start' }}>
        <span className='text-large mb-2'>There are some spelling mistakes, did you mean these words instead?</span>
        {mistakes.map(mistake => {
          return <span key={mistake['word']} className='text-larger'>"<b>{mistake['word']}</b>" : {mistake['recommendations'].join(', ')}</span>
        })}
      </div>
      <button
        className="AuthButton btn btn-primary no-shadow"
        style={{ gridArea: 'back', width: '100%', height: '100%' }}
        onClick={() => handleSubmit(false)}
      >
        Cancel
      </button>
      <button
        className="AuthButton btn btn-alert no-shadow"
        style={{ gridArea: 'proceed', width: '100%', height: '100%' }}
        onClick={() => handleSubmit(true)}
      >
        Proceed anyway
      </button>
    </div>
  );
}

export default React.memo(SpellCheck)