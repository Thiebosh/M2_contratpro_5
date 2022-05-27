import Tree from "react-d3-tree"
import {addChildren, deleteNode} from "./functions/node"

import InputNode from "./Nodes/InputNode";
import SelectNode from "./Nodes/SelectNode";
import AddElementNode from "./Nodes/AddElementNode";
import TextNode from "./Nodes/TextNode";


import './Tree.scss';

// la doc : https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html

interface CustomTreeProps {
    tree:any,
    setTree:React.Dispatch<any>,
    setIsOpen:Function,
    setModalElements:Function,
    socket:any,
    setErrorMsg:React.Dispatch<any>
    queue:any,
    setNewSocket:React.Dispatch<any>
}

export let g_syntax:any = {};
export const setGSyntax = (syntax:string) => g_syntax = syntax;

function addTargetNodePathAsLinkClass({source, target}:any) {
    return target.data.path;
}

function onLinkHover(source:any, target:any){
    const targetPath = target.data.path;
    const elems = document.querySelectorAll("[class^='rd3t-link "+ targetPath +"']");
    Array.from(elems).forEach((elem) => {
        if (elem.classList){
            elem.classList.add("hoveredLink");

        }
    })
}

function onLinkOut(source:any, target:any){
    const targetPath = target.data.path;
    const elems = document.querySelectorAll("[class^='rd3t-link "+ targetPath +"']");
    Array.from(elems).forEach((elem) => {
        if (elem.classList){
            elem.classList.remove("hoveredLink");

        }
    })
}


export function CustomTree(props:CustomTreeProps){

    function onLinkClick(source:any, target:any){
        target.data.syntaxKey === "+" ? props.setErrorMsg("Element can't be deleted") : deleteNode(target.data.path, props.tree, props.setTree, props.queue, props.setNewSocket ,props.socket)
    }

    function updateSelect(e: any) {
        console.log('new select:', e)
    }

    const updateValue = (value: string) => {
        console.log('new value:', value)
    }

    const handleAddElement = (nodeDatum: any) => {
        openModal(props.setIsOpen, nodeDatum, props.setModalElements, props.setTree, props.queue, props.setNewSocket, props.socket)
    }

    const renderRectSvgNode = ({ nodeDatum, toggleNode }:any) => {
        if(nodeDatum.type === "input"){
            return <InputNode nodeDatum={nodeDatum} updateValue={updateValue} tree={props.tree} setTree={props.setTree} queue={props.queue} setNewSocket={props.setNewSocket} socket={props.socket}/>;
        }
        else if (nodeDatum.type === "select"){
            return <SelectNode nodeDatum={nodeDatum} updateSelect={updateSelect} tree={props.tree} setTree={props.setTree} queue={props.queue} setNewSocket={props.setNewSocket} socket={props.socket}/>
        }
        else if (nodeDatum.type === "adding"){
            return <AddElementNode nodeDatum={nodeDatum} handleAddElement={handleAddElement} />
        }
        return <TextNode nodeDatum={nodeDatum} setTree={props.setTree}/>
    };

    return (
        <Tree
            onLinkMouseOver={onLinkHover}
            onLinkMouseOut={onLinkOut}
            onLinkClick={onLinkClick}
            svgClassName="tree"
            data={props.tree}
            translate={{x:window.innerWidth/4,y:window.innerHeight/2}}
            enableLegacyTransitions={true}
            renderCustomNodeElement={renderRectSvgNode}
            separation={{siblings: 1, nonSiblings: 1}}
            pathFunc="step"
            pathClassFunc={addTargetNodePathAsLinkClass}
        />
    );
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

function openModal(setIsOpen:Function, nodeData:any, setModalElements:Function, setTree:React.Dispatch<any>, queue:any, setNewSocket:React.Dispatch<any>, socket:any){
    const newChildrenSuggestion = getPossibleChildrenSuggestion(nodeData);
    const modalElements:any = []
    newChildrenSuggestion.forEach((suggestion:any) => {
        modalElements.push({
            text: suggestion,
            onclick: () => {
                addChildren(nodeData, suggestion, setTree, queue, setNewSocket, socket);
                setIsOpen(false);
            }
    })});
    setModalElements(modalElements)
    setIsOpen(true);
    
}
