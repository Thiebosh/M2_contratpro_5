import {MouseEventHandler} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import './styles.scss';

export default function AddElementNode({nodeDatum, handleAddElement}: {nodeDatum: any, handleAddElement: MouseEventHandler}) {
    return (
      <g className={"add-circle " + nodeDatum.path} onClick={() => handleAddElement(nodeDatum)}>
        <circle r="25" strokeDasharray="10,4" />

        <foreignObject width={22} height={22} x={-11} y={-11}>
          <FontAwesomeIcon icon={faPlus} size="1x" />
        </foreignObject>
      </g>
    )
}
