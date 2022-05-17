import { initChildrenIfNotDone } from "./utils"
import { g_setTree, g_syntax } from "../Tree"

export function addAddingNode(data:any){
    const addingNode = {
        name:"+",
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

        values.forEach((val:any) => {
            if (val[0] !== "?"){
                //@ts-ignore
                node[val] = {}
            }
        });
        
        nodeData.parent.children.push(node);
        addAddingNode(node);
        updateNodeChildren(node.parent);
        
    }
}

function initNewNode(suggestion:any, parent:any){
    return {
        name:suggestion,
        type:g_syntax[suggestion].type,
        children:[],
        parent:parent
    }
}


function updateNodeChildren(node:any){
    let currentParent = node.parent;
    while (currentParent.name !== "root"){
        currentParent = currentParent.parent;
    }
    g_setTree(currentParent);
}