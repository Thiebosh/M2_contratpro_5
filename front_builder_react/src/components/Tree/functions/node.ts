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
        // console.log(node)
        nodeData.parent.children.splice(-1,0,node);
        addAddingNode(node);
        updateNodeChildren(node.parent);
        
    }
}

function hasMandatoryValues(node:any){
    const values = g_syntax[node.syntaxKey].values;

    if (values){
        return values.some((v:any) => v[0] !== "?");
    }
    return false;
}

function createMandatoryChildren(node:any){
    if(hasMandatoryValues(node)){
        g_syntax[node.syntaxKey].values.forEach((val:any) => {
            if (val[0] !== "?"){
                //@ts-ignore
                node[val] = initNewNode(val, node);
                //@ts-ignore
                node.children.push(node[val]);
                createMandatoryChildren(node[val]);
            }
        });
    }
}

function initNewNode(suggestion:any, parent:any){
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