import React, {MouseEventHandler} from 'react';

import './styles.scss';

export default function AddElementNode({nodeDatum, handleAddElement}: {nodeDatum: any, handleAddElement: MouseEventHandler}) {
    return (
      <g className="add-circle">
        <circle r="25" stroke-dasharray="10,4" onClick={() => handleAddElement(nodeDatum)}/>
        <text fill="white" textAnchor="middle">
          +
        </text>
      </g>
    )
}
