import React from 'react';
import './styles.scss';

export default function InputNode({ nodeDatum, updateValue }: {nodeDatum:any, updateValue: Function}) {
  let updateDelay: NodeJS.Timeout;

  function handleChange(e: any) {
    clearInterval(updateDelay);
    // Delay update
    updateDelay = setTimeout(() => {
      if (nodeDatum.nature === "checkbox") {
        updateValue(!!e.target.checked)
      } else {
        if (e.target.value) {
          updateValue(e.target.value)
        }
      }
    },300)
  }

  return (
      <g className={nodeDatum.path}>
        <foreignObject width={120} height={70} y={-35} x={-60}>
          <div className="node-div">
            <label>{nodeDatum.syntaxKey}</label>
            <input type={nodeDatum.nature} defaultChecked={nodeDatum.value} defaultValue={nodeDatum.value} onChange={handleChange}/>
          </div>
        </foreignObject>
      </g>
    )
}
