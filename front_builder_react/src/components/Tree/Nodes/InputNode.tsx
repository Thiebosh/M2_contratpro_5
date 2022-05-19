import React from 'react';

export default function InputNode({ nodeDatum, updateValue }: {nodeDatum:any, updateValue: Function}) {
  let updateDelay: NodeJS.Timeout;

  function handleChange(e: any) {
    clearInterval(updateDelay);
    // Delay update
    updateDelay = setTimeout(() => {
      if (e.target.value) {
        updateValue(e.target.value)
      }
    },500)
  }

  return (
      <g className={nodeDatum.path}>
        <foreignObject width={120} height={60} y={-30} x={-60}>
          <label>{nodeDatum.syntaxKey}</label>
          <input type={nodeDatum.nature} checked={nodeDatum.value} defaultValue={nodeDatum.value} onChange={handleChange}/>
        </foreignObject>
      </g>
    )
}
