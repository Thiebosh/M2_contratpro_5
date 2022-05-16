import clone from "clone";
import {
    initChildrenIfNotDone,
    skipKey,
    moveElementAtFirstPosition
} from "./utils"
import { addAddingNode } from "./node"

function formatArray(node:any, key:string, syntax:any){
    // key is the key of the json for the current iteration, it's a data of the node
    initChildrenIfNotDone(node); // to add children of current node as value of children key

    for (let i = 0; i < node[key].length; i++){
        initChildrenIfNotDone(node[key][i]); // to add adding node as child of all the children of the array
        addAddingNode(node[key][i]);

        node[key][i].name = key;
        node.children.splice(-2,0,node[key][i]);
        formatData(node[key][i], syntax);
    }
}

function formatObject(node:any, key:string, syntax:any){
    node[key].name = key;

    initChildrenIfNotDone(node);
    initChildrenIfNotDone(node[key]); // same as for formatArray
    
    addAddingNode(node[key]);

    node.children.splice(-2,0,node[key]);
    formatData(node[key], syntax);
}

function formatField(node:any, key:string, syntax:any){
    const fieldType = syntax[key].field; // type of field for current node
    const fieldSyntax = syntax[fieldType]; // sytnax for the specific field

    if (fieldSyntax){
        if (!node.children){
            node.children = [];
        }
        let fieldSyntaxClone = clone(fieldSyntax);
        fieldSyntaxClone.value = node[key];
        
        if (fieldSyntaxClone.type === "select"){
            fieldSyntaxClone.label = key;
            moveElementAtFirstPosition(fieldSyntaxClone.values,node[key])
        }

        node.children.splice(-2,0,fieldSyntaxClone);
    }
}

export function formatData(data:any, syntax:any){
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