import React from 'react';
import './styles.scss';
import { updateValueOnNode } from "./../functions/node"

export default function InputNode({ nodeDatum, updateValue, tree, setTree, socket}: {nodeDatum:any, updateValue: Function, tree:any, setTree:React.Dispatch<any>, socket:any}) {
  let updateDelay: NodeJS.Timeout;

  function handleChange(e: any) {
    clearInterval(updateDelay);
    // Delay update
    updateDelay = setTimeout(() => {
      if (nodeDatum.nature === "checkbox") {
        updateValue(!!e.target.checked)
      } else {
        if (e.target.value) {
          updateValueOnNode(e.target.value, e.target.className, tree, setTree, socket);
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
            <input  className={nodeDatum.path+"_input"} type={nodeDatum.nature} defaultChecked={nodeDatum.value} defaultValue={nodeDatum.value} onChange={handleChange}/>
          </div>
        </foreignObject>
      </g>
    )
}
