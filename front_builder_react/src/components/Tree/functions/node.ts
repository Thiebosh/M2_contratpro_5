import { initChildrenIfNotDone } from "./utils"
import { g_setTree, g_syntax } from "../Tree"

export function addAddingNode(data:any){
    const addingNode = {
        syntaxKey:"+",
        type:"adding",
        parent:data,
    };

    data.children.push(addingNode);
}

export function addChildren(nodeData:any, suggestion:any){
    // suggestion = selected new node
    const values = g_syntax[suggestion].values;
    if (values){
        initChildrenIfNotDone(nodeData.parent);
        const node = initNewNode(suggestion, nodeData.parent)

        createMandatoryChildren(node);
        
        nodeData.parent.children.splice(-1,0,node);
        addAddingNode(node);
        updateNodeChildren(node.parent);
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
        return {
            syntaxKey:suggestion,
            type:fieldSyntax.type,
            parent:parent,
            nature:fieldSyntax.nature,
            value:""
        }
    }
    return {
        syntaxKey:suggestion,
        type:g_syntax[suggestion].type,
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
    g_setTree(currentParent ? currentParent : node);
}