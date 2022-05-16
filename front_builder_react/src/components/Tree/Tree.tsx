import { useEffect, useState } from "react";
import Tree from "react-d3-tree"
import clone from "clone";

import './Tree.scss';

// la doc : https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html

interface CustomTreeProps {
    syntax_filename:string,
    openClose:Function
}
function openModal(setIsOpen:any){
    setIsOpen(true)
}

export function CustomTree(props:CustomTreeProps){
    // formatData(data)
    const [tree, setTree] = useState<any>();

    useEffect(() => {
        getDataFromJson()
        .then((data => init(props.syntax_filename, data, setTree)));
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
        } else if (nodeDatum.type === "adding"){
            return(
                <g>
                  <circle r="25" onClick={()=> openModal(props.openClose)}>
                </circle>
                  <text fill="white" textAnchor="middle">
                    +
                  </text>
                
                </g>)
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
        <>{ tree &&
            <Tree
                svgClassName="tree"
                data={tree}
                translate={{x:window.innerWidth*1/4,y:window.innerHeight/2}}
                transitionDuration={0.5}
                renderCustomNodeElement={renderRectSvgNode}
            />
        }</>
    )
}

function init(filename:string, data:any, setTree:React.Dispatch<any>){
    fetch("/syntaxes/"+filename+".json")
    .then(syntax => syntax.json())
    .then(syntaxJson => {
        formatData(data, syntaxJson);
        data = [data["root"]];
        data.name = "root";
        setTree(data);
    })
}

function getDataFromJson():Promise<Record<string, unknown>>{
    return fetch("/example.json")
    .then(data => data.json())
}


function formatData(data:any, syntax:any){
    for (const key in data){
        if (key === "name" || key === "children"){
            continue;
        }

        if (syntax[key].type === "array"){
            if (!data.children){
                data.children = [];
            }
            for (let i = 0; i < data[key].length; i++){
                if (!data[key][i].children){
                    data[key][i].children = [];
                }
                data[key][i].children.push({
                    name:"+",
                    type:"adding"
                });
                data[key][i].name = key;
                data.children.splice(-2,0,data[key][i])
                formatData(data[key][i], syntax);
            }
        } else if (syntax[key].type === "object"){
            data[key].name = key
            if (!data.children){
                data.children = [];
            }
            if (!data[key].children){
                data[key].children = [];
            }
            data[key].children.push({
                name:"+",
                type:"adding"
            });
            data.children.splice(-2,0,data[key]);
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
                data.children.splice(-2,0,node);
            }
        }
    }
}
