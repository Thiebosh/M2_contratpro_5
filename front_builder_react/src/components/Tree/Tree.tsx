import { useEffect, useState } from "react";
import Tree from "react-d3-tree"
import clone from "clone";

import './Tree.scss';

// la doc : https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html

interface CustomTreeProps {
    syntax_filename:string,
    openClose:Function
}

function getParentChildrenValues(nodeData:any){
    let parentChildrenValues:any = [];

    nodeData.parent.children.forEach((child:any) => {
        if(child.type !== "adding"){
            parentChildrenValues.push(child.name); // pour éviter de les proposer si object et qu'on ne peut pas en avoir plusieurs
        }
    });
    return parentChildrenValues;
}

function getPossibleChildrenSuggestion(nodeData:any, syntax:any){
    let parentChildrenValues = getParentChildrenValues(nodeData);
    let parentSyntax = syntax[nodeData.parent.name];
    let newChildrenSuggestion:any = [];

    parentSyntax.values.forEach((v:any) => {
        if(v[0] === "?"){
            v = v.substring(1);
        }

        if (parentSyntax.type === "array" || (parentSyntax.type !== "array" && !parentChildrenValues.includes(v))){
            newChildrenSuggestion.push(v)
        }
    });
    
    return newChildrenSuggestion;
}

function openModal(setIsOpen:Function, nodeData:any, syntax:any){
    setIsOpen(true);
    let newChildrenSuggestion = getPossibleChildrenSuggestion(nodeData, syntax);

    
    console.log(newChildrenSuggestion);
}

export function CustomTree(props:CustomTreeProps){

    const [tree, setTree] = useState<any>();
    const [syntax, setSyntax] = useState<any>();


    useEffect(() => {
        getDataFromJson()
        .then((data => init(props.syntax_filename, data, setTree, setSyntax)));
    }, [props.syntax_filename])


    const renderRectSvgNode = ({ nodeDatum, toggleNode }:any) => {
        if(nodeDatum.type === "input"){
            return (
                <g>
                    <foreignObject width={100} height={100} y={-10} x={-30}>
                        <input type={nodeDatum.nature} value={nodeDatum.value} onChange={() => console.log("fds")}/>
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
                  <circle r="25" onClick={()=> openModal(props.openClose, nodeDatum, syntax)}>
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

function init(filename:string, data:any, setTree:React.Dispatch<any>, setSyntax:React.Dispatch<any>){
    fetch("/syntaxes/"+filename+".json")
    .then(syntax => syntax.json())
    .then(syntaxJson => {
        setSyntax(syntaxJson);
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

function skipKey(key:string){
    const keysToSkip = ["name", "children", "parent"]
    return keysToSkip.includes(key)
}

function formatArray(data:any, key:string, syntax:any){
    if (!data.children){
        data.children = [];
    }
    for (let i = 0; i < data[key].length; i++){
        if (!data[key][i].children){
            data[key][i].children = [];
        }
        data[key][i].children.push({
            name:"+",
            type:"adding",
            parent:data[key][i]
        });
        data[key][i].name = key;
        data.children.splice(-2,0,data[key][i])
        formatData(data[key][i], syntax);
    }
}

function formatObject(data:any, key:string, syntax:any){
    data[key].name = key
    if (!data.children){
        data.children = [];
    }
    if (!data[key].children){
        data[key].children = [];
    }
    data[key].children.push({
        name:"+",
        type:"adding",
        parent:data[key]
    });
    data.children.splice(-2,0,data[key]);
    formatData(data[key], syntax);
}

function formatField(data:any, key:string, syntax:any){
    if (syntax[syntax[key].field]){
        if (!data.children){
            data.children = [];
        }
        let node = clone(syntax[syntax[key].field]);
        node.value = data[key];

        if (node.values){
            let selectedElemIndex = node.values.indexOf(data[key]);
            node.values.splice(selectedElemIndex,1);
            node.values.splice(0,0,data[key]);
        }
        if (node.type === "select"){
            node.label = key;
        }

        data.children.splice(-2,0,node);
    }
}

function formatData(data:any, syntax:any){
    for (const key in data){
        if (skipKey(key)){
            continue;
        }
        switch(syntax[key].type){
            case "array":
                formatArray(data, key, syntax)
                break;
            case "object":
                formatObject(data, key, syntax)
                break;
            case "field":
                formatField(data, key, syntax)
                break;
        }
    }
    }