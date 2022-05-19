import React from 'react';

import './styles.scss';

export default function SelectNode({nodeDatum, updateSelect}: {nodeDatum: any, updateSelect: Function}) {
  function handleSelect(e: any) {
    updateSelect(e.target.value)
  }

  return (
    <g className={nodeDatum.path}>
      <foreignObject width={120} height={70} y={-35} x={-60}>
        <div className="node-div"><label>{nodeDatum.syntaxKey}</label>
          <select onChange={handleSelect}>
            {nodeDatum.values.map((optionValue: any) => (
              <option key={optionValue} value={optionValue}>{optionValue}</option>
            ))}
          </select></div>
      </foreignObject>
    </g>
  )
}
