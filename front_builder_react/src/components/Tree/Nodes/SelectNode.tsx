import React from 'react'

export default function SelectNode({nodeDatum, updateSelect}: {nodeDatum: any, updateSelect: Function}) {
  function handleSelect(e: any) {
    updateSelect(e.target.value)
  }

  return (
    <g className={nodeDatum.path}>
      <foreignObject width={120} height={60} y={-30} x={-60}>
        <label>{nodeDatum.syntaxKey}</label>
        <select onChange={handleSelect}>
          {nodeDatum.values.map((v:any) =>
          {return <option value={v}>{v}</option>})}
        </select>
      </foreignObject>
    </g>
  )
}
