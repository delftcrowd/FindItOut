import React from 'react';
import Card from '../Card/Card';

const Board = (props) => {

  return (
    <div className="CardBoard_Wrapper">
      <div className="CardBoard">
        {props.objects.map((object, index) =>
          <Card index={index} imageLink={object.image_url} key={object.id} name={object.id} definitions={object.definitions} showName />
        )
        }
      </div>
    </div>
  )
}

export default React.memo(Board)