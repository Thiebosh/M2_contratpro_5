import { useEffect, useState } from "react";
import Tree from "react-d3-tree"
import clone from "clone";

import './Tree.scss';

// la doc : https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html
const debugData = [
    {
      name: "root",
      children: [
        {
          name: "screen",
          type:"array",
          children:[
              {
                  name:"0",
                  type:"object",
              },
              {
                  name:"1",
                  type:"object"
              },
              {
                  name:"+",
                  type:"adding"
              }
          ]
        }
      ]
    }
];

// var state:any = {
//     data: debugData
// }


export function CustomTree(){
    // formatData(data)
    const [tree, setTree] = useState<any>(debugData);

    useEffect(() => {
        getDataFromJson()
        .then((d => init(d, setTree)));
    }, [])

    const renderRectSvgNode = ({ nodeDatum, toggleNode }:any) => {
        if(nodeDatum.type === "input"){
            return (
                <g>
                    <foreignObject width={100} height={100} y={-10} x={-30}>
                        <input type={nodeDatum.nature} defaultValue={nodeDatum.value} onChange={() => console.log("fds")}/>
                    </foreignObject>
                </g>
            );
        } else if (nodeDatum.type === "select"){
            return (
                <g>
                    <foreignObject width={100} height={100} y={-10} x={-30}>
                        <label>{nodeDatum.label} :</label>
                        <select>
                            {nodeDatum.values.map((v:any) =>
                            {return <option value={v}>{v}</option>})}
                        </select>
                    </foreignObject>
                </g>
            );
        }
        return(
        <g>
          <circle r="25" onClick={toggleNode}>
        </circle>
          <text fill="white" textAnchor="middle">
            {nodeDatum.name}
          </text>
        
        </g>)
    };
    return (
            <Tree
                svgClassName="tree"
                data={tree}
                translate={{x:window.innerWidth*1/4,y:window.innerHeight/2}}
                transitionDuration={0.5}
                renderCustomNodeElement={renderRectSvgNode}
                onNodeClick={(nodeData:any) => {
                    if (nodeData.data.type === "adding"){
                        console.log(nodeData) 
                        //nodeData = juste en accès, uniquement pour récup infos, pas pour modifier
                        const nextData:any = clone(tree)
                        if (nodeData.parent.data.type === "array"){
                            addChild(nextData[0], nodeData.parent.data.name)
                            // nodeData.parent.children.push({
                            //     name:"newObject",
                            //     type:"object"
                            // })
                        }
                        // const target = nextData[0].children;
                        // target.push({
                        //     name:"new",
                        //     type:"array",
                        //     children:[{
                        //         name:"1",
                        //         type:"object"

                        //     }
                        //     ]
                        // });
                        setTree(nextData);
                    }
                }}
            />
    )
}

function addChild(node:any, name:any){
    if (node.children){
        if(node.name === name){
            node.children.splice(-1,0,{
                name:"fd"
            })
        } else{
            node.children.forEach((o: any) => addChild(o,name))
        }

    }
}

function init(data:any, setTree:any){
    fetch("/syntax.json").then(syntax => {return syntax.json()}).then(syntaxJson => {
        formatData(data, syntaxJson);
        data = [data["root"]];
        data.name = "root";
        setTree(data);
    })
}

function getDataFromJson(){
    return fetch("/example.json").then(data => {
        return data.json();
    })
}


function formatData(data:any, syntax:any){
    for (const key in data){
        if (key === "name"){
            continue;
        }

        if (syntax[key].type === "array"){
            for (let i = 0; i < data[key].length; i++){
                data[key][i].name = key;
                if (!data.children){
                    data.children = [];
                }
                data.children.push(data[key][i])
                if (i === data[key].length -1 ){
                    data.children.push({
                        name:"+",
                        type:"adding"
                    });
                }
                formatData(data[key][i], syntax);
            }
        } else if (syntax[key].type === "object"){
            data[key].name = key
            if (!data.children){
                data.children = [];
            }
            data.children.push(data[key]);
            // data.children.push({ // WIP : there is an extra "+" after style nodes
            //     name:"+",
            //     type:"adding"
            // })
            formatData(data[key], syntax);
        } else if(syntax[key].type === "field") {
            if (syntax[syntax[key].field]){
                if (!data.children){
                    data.children = [];
                }
                let node = syntax[syntax[key].field];
                if (!node.values){
                    node.value = data[key];
                }
                if (node.type === "select"){
                    node.label = key;
                }
                data.children.push(node);
            }
        }
    }
}
