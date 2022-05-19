import React, {MouseEventHandler} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import './styles.scss';

export default function AddElementNode({nodeDatum, handleAddElement}: {nodeDatum: any, handleAddElement: MouseEventHandler}) {
    return (
      <g className="add-circle">
        <circle r="25" stroke-dasharray="10,4" onClick={() => handleAddElement(nodeDatum)}/>
        {/* <FontAwesomeIcon icon={faPlus}/> */}
        <text fill="white" textAnchor="middle">
          +
        </text>
      </g>
    )
}
