import React, { useState } from 'react';
import './styles.scss';
import { updateNodeChildren } from "./../functions/node"




export default function TextNode({ nodeDatum, setTree}: {nodeDatum: any, setTree:React.Dispatch<any>}) {
  
  const [expand, setExpand] = useState(true);

  function toggleNode(){
      if (expand) {
        nodeDatum._children = nodeDatum.children;
        nodeDatum.children = [];
      } else {
          nodeDatum.children = nodeDatum._children;
          nodeDatum._children = [];
      }
      setExpand(!expand);
      updateNodeChildren(nodeDatum, setTree);
  }

  
  
  return (
      <g className={nodeDatum.path} onClick={toggleNode}>
        <circle r="25" />
        <text fill="white" textAnchor="middle">
          {nodeDatum.syntaxKey}
        </text>
      </g>
    )
}
