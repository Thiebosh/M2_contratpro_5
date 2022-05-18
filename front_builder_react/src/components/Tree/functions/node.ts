import { initChildrenIfNotDone } from "./utils"
import { g_setTree, g_syntax, root } from "../Tree"
import clone from "clone";

export function addAddingNode(data:any){
    const addingNode = {
        syntaxKey:"+",
        type:"adding",
        parent:data,
    };

    data.children.push(addingNode);
}

export function findNodeWithPathForCreate(path:string, data:any, i:number=0){
    //@ts-ignore
    const splittedPath = path.split("/");
    const nextSubPath = splittedPath[i+1]
    // console.log(path.split("/").join("/"))
    // console.log(data, nextSubPath)
    // if (data[nextSubPath]){
    //     data[nextSubPath].push(initNewNode(nextSubPath, data));
    // } else {
    //     data[nextSubPath] = initNewNode(nextSubPath, data);
    // }
    addChildren(data, nextSubPath)

    if (i < splittedPath.length - 2){
        findNodeWithPathForCreate(path, data[nextSubPath], i+1);
    } else {
        return data;
    }
}

export function addChildren(nodeData:any, suggestion:any, socket?:any){
    // suggestion = selected new node
    const values = g_syntax[suggestion].values;
    let node;
    let parent = nodeData.parent ? nodeData.parent : nodeData;
    if (values){
        initChildrenIfNotDone(parent);
        node = initNewNode(suggestion, parent)
    
        createMandatoryChildren(node);
        
        addNewNodeAsValueInNodeData(node);
        parent.children.splice(-1,0,node);
        addAddingNode(node);
        updateNodeChildren(node.parent);
    } else {
        node = initNewNode(suggestion, parent)
    
        createMandatoryChildren(node);

        addNewNodeAsValueInNodeData(node);
        parent.children.splice(-1,0,node);
        updateNodeChildren(node.parent);
    }
    
    if (socket){
        socket.send(JSON.stringify(
            {
                action:"create",
                path:"root/screen",
                content:{
                    name:""
                }
            }
            ))
    }
}

function hasMandatoryValues(node:any){
    if (g_syntax[node.syntaxKey]){ // if we are at the end of the tree branch, this condition is false
        const values = g_syntax[node.syntaxKey].values;
    
        if (values){
            return values.some((v:any) => v[0] !== "?"); // at least one value is mandatory (doesn't get a "?")
        }
    }
    return false;
}

function addNewNodeAsValueInNodeData(node:any){
    if (node.parent[node.syntaxKey]){ // if array
        node.parent[node.syntaxKey].push(node);
    } else {
        if (g_syntax[node.syntaxKey].type === "field"){ // if field, we init with empty value
            node.parent[node.syntaxKey] = "";
        } else { // else, it contains values of the node
            node.parent[node.syntaxKey] = node;
        }
    }
}

function createMandatoryChildren(node:any){
    if(hasMandatoryValues(node)){
        g_syntax[node.syntaxKey].values.forEach((val:any) => {
            if (val[0] !== "?"){
                //@ts-ignore
                const newNode = initNewNode(val, node);
                node[val] = g_syntax[val].type === "field" ? "" : newNode; 
                //If field, value is empty (fields don't have json as value), else it contains the json

                //@ts-ignore
                node.children.push(newNode);
                createMandatoryChildren(newNode);
            }
        });
    }
}

function initNewNode(suggestion:any, parent:any){
    if (g_syntax[suggestion].type === "field"){ // if field, we have a different syntax of the node
        const fieldSyntax = g_syntax[g_syntax[suggestion].field];
        let nodeSyntax = {
            syntaxKey:suggestion,
            type:fieldSyntax.type,
            parent:parent,
        };
        if (fieldSyntax.type === "input"){
            //@ts-ignore
            nodeSyntax.nature = fieldSyntax.nature;
            //@ts-ignore
            nodeSyntax.value = "";
        } else if (fieldSyntax.type === "select") {
            //@ts-ignore
            nodeSyntax.values = fieldSyntax.values;
        }
        return nodeSyntax;
    }
    return {
        syntaxKey:suggestion,
        children:[],
        parent:parent
    }
}


function updateNodeChildren(node:any){
    let currentParent;

    if (node.parent) {
        currentParent = node.parent;
        
        while (currentParent.syntaxKey !== "root"){
            currentParent = currentParent.parent;
        }
    }
    g_setTree(currentParent ? clone(currentParent) : clone(node));
}