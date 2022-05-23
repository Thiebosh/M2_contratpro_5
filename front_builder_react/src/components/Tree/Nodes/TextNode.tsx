import {MouseEventHandler} from 'react';

import './styles.scss';

export default function TextNode({ nodeDatum, toggleNode }: {nodeDatum: any, toggleNode: MouseEventHandler}) {
    return (
      <g className={nodeDatum.path} onClick={toggleNode}>
        <circle r="25" />
        <text fill="white" textAnchor="middle">
          {nodeDatum.syntaxKey}
        </text>
      </g>
    )
}
