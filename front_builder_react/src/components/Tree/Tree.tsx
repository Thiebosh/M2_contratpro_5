import { useEffect, useState } from "react";
import Tree from "react-d3-tree"
import { formatData } from "./functions/format"

import './Tree.scss';

// la doc : https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html

interface CustomTreeProps {
    syntax_filename:string,
    openClose:Function,
    setModalElements:Function
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
                  <circle r="25" onClick={()=> openModal(props.openClose, nodeDatum, syntax, props.setModalElements)}>
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

function openModal(setIsOpen:Function, nodeData:any, syntax:any, setModalElements:Function){
    const newChildrenSuggestion = getPossibleChildrenSuggestion(nodeData, syntax);
    const modalElements:any = []
    newChildrenSuggestion.forEach((suggestion:any) => {
        modalElements.push({
            text: suggestion,
            onclick: () => console.log(suggestion)
    })});
    setModalElements(modalElements)
    setIsOpen(true);
    
}