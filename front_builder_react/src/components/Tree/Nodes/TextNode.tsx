import React, {MouseEventHandler} from 'react';

import './styles.scss';

export default function TextNode({ nodeDatum, toggleNode }: {nodeDatum: any, toggleNode: MouseEventHandler}) {
    return (
      <g className={nodeDatum.path}>
        <circle r="25" onClick={toggleNode}/>
        <text fill="white" textAnchor="middle">
          {nodeDatum.syntaxKey}
        </text>
      </g>
    )
}
