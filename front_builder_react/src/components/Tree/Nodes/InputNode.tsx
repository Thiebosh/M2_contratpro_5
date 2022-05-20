import React, { useEffect, useState } from 'react';
import './styles.scss';
import { updateValueOnNode } from "./../functions/node";

function changeOnEnter(){
  
}

export default function InputNode({ nodeDatum, updateValue, tree, setTree, socket}: {nodeDatum:any, updateValue: Function, tree:any, setTree:React.Dispatch<any>, socket:any}) {

  const [value, setValue] = useState(nodeDatum.value);
  const [checked, setChecked] = useState(nodeDatum.value);

  useEffect(()=> {
    setValue(nodeDatum.value);
    setChecked(nodeDatum.value);
  }, [nodeDatum.value]);

  function changeOnEnter(e:any){
    if (nodeDatum.nature === "text" && e.target.value && e.target.className){
      updateValueOnNode(e.target.value, e.target.className, tree, setTree, socket);
    }
  }

  function handleChange(e: any) {
    if (nodeDatum.nature === "checkbox") {
      setChecked(!!e.target.checked)
    } else {
      if (e.target.value) {
        setValue(e.target.value)
      }
    }
    
      if (nodeDatum.nature === "checkbox") {
        updateValue(!!e.target.checked)
      } else if (nodeDatum.nature !== "text" && e.target.value && e.target.className){
          updateValueOnNode(e.target.value, e.target.className, tree, setTree, socket);
          updateValue(e.target.value)
      }
  }

  return (
      <g className={nodeDatum.path}>
        <foreignObject width={120} height={70} y={-35} x={-60}>
          <div className="node-div">
            <label>{nodeDatum.syntaxKey}</label>
            <input  className={nodeDatum.path+"_input"} type={nodeDatum.nature} checked={checked} 
            value={value} onChange={handleChange} onKeyDown={(e)=>(e.key === "Enter") && changeOnEnter(e)}/>
          </div>
        </foreignObject>
      </g>
    )
}
