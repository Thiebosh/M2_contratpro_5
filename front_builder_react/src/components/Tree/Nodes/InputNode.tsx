import React, { useEffect, useState } from 'react';
import { updateValueOnNode } from "../functions/node";
import './styles.scss';

export default function InputNode({ nodeDatum, updateValue, tree, setTree, queue, setNewSocket, socket}: {nodeDatum:any, updateValue: Function, tree:any, setTree:React.Dispatch<any>, queue:any, setNewSocket:React.Dispatch<any>, socket:any}) {

  const [value, setValue] = useState(nodeDatum.value);
  const [checked, setChecked] = useState(nodeDatum.value);

  useEffect(()=> {
    if (nodeDatum.value !== undefined) {
      setValue(nodeDatum.value);
      setChecked(nodeDatum.value);
    }
  }, [nodeDatum.value]);

  function handleChange(e: any) {
    if (nodeDatum.nature === "checkbox") {
      setChecked(!!e.target.checked)
    } else {
      setValue(e.target.value);
    }
  }

  useEffect(() => {
    if (value !== nodeDatum.value) {
      const delayedUpdate = setTimeout(() => {
        updateValueOnNode(value, nodeDatum.path + "_input", tree, setTree, queue, setNewSocket, socket);
        updateValue(value)
      }, 400);
      return () => clearTimeout(delayedUpdate);
    }
  }, [value])

  useEffect(() => {
    if (checked !== nodeDatum.value) {
      const delayedUpdate = setTimeout(() => {
        updateValue(checked)
      }, 400);
      return () => clearTimeout(delayedUpdate);
    }
  }, [checked])

  return (
      <g className={nodeDatum.path}>
        <foreignObject width={120} height={70} y={-35} x={-60}>
          <div className="node-div">
            <div className="node-content">
              <label>{nodeDatum.syntaxKey}</label>
              <input
                className={nodeDatum.path + "_input"}
                type={nodeDatum.nature}
                checked={checked}
                value={value}
                onChange={handleChange}
              />
            </div>
          </div>
        </foreignObject>
      </g>
    )
}
