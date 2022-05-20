import React from 'react';
import { updateValueOnNode } from "./../functions/node";
import './styles.scss';

export default function SelectNode({nodeDatum, updateSelect, tree, setTree, socket}: {nodeDatum: any, updateSelect: Function, tree:any, setTree:React.Dispatch<any>, socket:any}) {
  function handleSelect(e: any) {
    updateValueOnNode(e.target.value, e.target.className, tree, setTree, socket);
    updateSelect(e.target.value)
  }

  return (
    <g className={nodeDatum.path}>
      <foreignObject width={120} height={70} y={-35} x={-60}>
        <div className="node-div"><label>{nodeDatum.syntaxKey}</label>
          <select onChange={handleSelect} className={nodeDatum.path+"_select"}>
            {nodeDatum.values.map((optionValue: any) => (
              <option key={optionValue} value={optionValue}>{optionValue}</option>
            ))}
          </select></div>
      </foreignObject>
    </g>
  )
}
