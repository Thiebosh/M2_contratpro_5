import {useEffect, useState} from "react";
import Tree from "react-d3-tree"
import {formatData} from "./functions/format"
import {addChildren} from "./functions/node"

import './Tree.scss';
import TextInputNode from "./Nodes/TextInputNode";
import SelectNode from "./Nodes/SelectNode";
import AddElementNode from "./Nodes/AddElementNode";
import TextNode from "./Nodes/TextNode";

// la doc : https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html

interface CustomTreeProps {
    syntax_filename:string,
    openClose:Function,
    setModalElements:Function,
    socket:any
}

export let g_syntax:any = {};

export function CustomTree(props:CustomTreeProps){

    const [tree, setTree] = useState<any>();
    const [syntax, setSyntax] = useState<any>();

    useEffect(() => {
        getDataFromJson()
        .then((data => init(props.syntax_filename, data, setTree, setSyntax)));
    }, [props.syntax_filename])

    function updateSelect(e: any) {
        console.log('new select:', e)
    }

    const updateValue = (value: string) => {
        console.log('new value:', value)
    }

    const handleAddElement = (nodeDatum: any) => {
        openModal(props.openClose, nodeDatum, props.setModalElements, props.socket)
    }

    const renderRectSvgNode = ({ nodeDatum, toggleNode }:any) => {
        if(nodeDatum.type === "input"){
            return <TextInputNode nodeDatum={nodeDatum} updateValue={updateValue} />;
        }
        else if (nodeDatum.type === "select"){
            return <SelectNode nodeDatum={nodeDatum} updateSelect={updateSelect} />
        }
        else if (nodeDatum.type === "adding"){
            return <AddElementNode nodeDatum={nodeDatum} handleAddElement={handleAddElement} />
        }
        return <TextNode nodeDatum={nodeDatum} toggleNode={toggleNode} />
    };

    return tree && (
        <Tree
            svgClassName="tree"
            data={tree}
            translate={{x:window.innerWidth/4,y:window.innerHeight/2}}
            transitionDuration={0.5}
            renderCustomNodeElement={renderRectSvgNode}
        />
    )
}


export let root = undefined;
export let g_setTree:Function;

function init(filename:string, data:any, setTree:React.Dispatch<any>, setSyntax:React.Dispatch<any>){
    fetch("/syntaxes/"+filename+".json")
    .then(syntax => syntax.json())
    .then(syntaxJson => {
        setSyntax(syntaxJson);
        g_syntax = syntaxJson;
        data["root"].path = "root"
        formatData(data);
        data = data["root"];
        data.parent = null;
        setTree(data);
        root = data;
        g_setTree = setTree;
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
            parentChildrenValues.push(child.syntaxKey); // pour éviter de les proposer si object et qu'on ne peut pas en avoir plusieurs
        }
    });
    return parentChildrenValues;
}

function getPossibleChildrenSuggestion(nodeData:any){
    let parentChildrenValues = getParentChildrenValues(nodeData);
    let parentSyntax = g_syntax[nodeData.parent.syntaxKey];
    let newChildrenSuggestion:any = [];

    parentSyntax.values.forEach((v:any) => {
        if(v[0] === "?"){
            v = v.substring(1);
        }

        if (g_syntax[v].type === "array" || (g_syntax[v].type !== "array" && !parentChildrenValues.includes(v))){
            newChildrenSuggestion.push(v)
        }
    });
    
    return newChildrenSuggestion;
}

function openModal(setIsOpen:Function, nodeData:any, setModalElements:Function, socket:any){
    const newChildrenSuggestion = getPossibleChildrenSuggestion(nodeData);
    const modalElements:any = []
    newChildrenSuggestion.forEach((suggestion:any) => {
        modalElements.push({
            text: suggestion,
            onclick: () => {
                addChildren(nodeData, suggestion, socket);
                setIsOpen(false);
            }
    })});
    setModalElements(modalElements)
    setIsOpen(true);
    
}
