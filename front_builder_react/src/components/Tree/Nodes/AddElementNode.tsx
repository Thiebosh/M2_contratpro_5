import React, {MouseEventHandler} from 'react'

export default function AddElementNode({nodeDatum, handleAddElement}: {nodeDatum: any, handleAddElement: MouseEventHandler}) {
    return (
      <g className="add-circle">
        <circle r="25" onClick={() => handleAddElement(nodeDatum)}/>
        <text fill="white" textAnchor="middle">
          +
        </text>
      </g>
    )
}
