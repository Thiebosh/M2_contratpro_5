import clone from "clone";
import {
    initChildrenIfNotDone,
    skipKey,
    moveElementAtFirstPosition
} from "./utils"

import { g_syntax } from "../Tree"

import { addAddingNode } from "./node"

function formatArray(node:any, key:string){
    // key is the key of the json for the current iteration, it's a data of the node
    initChildrenIfNotDone(node); // to add children of current node as value of children key

    for (let i = 0; i < node[key].length; i++){
        initChildrenIfNotDone(node[key][i]); // to add adding node as child of all the children of the array
        addAddingNode(node[key][i]);
        
        node[key][i].path = node.path + "/" + key + "/" + i;
        node[key][i].syntaxKey = key;
        node[key][i].parent = node;

        node.children.splice(-1,0,node[key][i]);
        formatData(node[key][i]);
    }
}

function formatObject(node:any, key:string) {
    node[key].syntaxKey = key;
    node[key].parent = node;

    if (node.path){
        node[key].path = node.path + "/" + key;
    }

    initChildrenIfNotDone(node);
    initChildrenIfNotDone(node[key]); // same as for formatArray
    
    addAddingNode(node[key]);

    node.children.splice(-1,0,node[key]);
    formatData(node[key]);
}

function formatField(node:any, key:string){
    const fieldType = g_syntax[key].field; // type of field for current node
    const fieldSyntax = g_syntax[fieldType]; // syntax for the specific field

    if (fieldSyntax){
        initChildrenIfNotDone(node);

        let fieldSyntaxClone = clone(fieldSyntax);
        fieldSyntaxClone.value = node[key];
        fieldSyntaxClone.parent = node;
        fieldSyntaxClone.syntaxKey = key;
        fieldSyntaxClone.path = node.path + "/" + key;

        if (fieldSyntaxClone.type === "select"){
            moveElementAtFirstPosition(fieldSyntaxClone.values,node[key])
        }

        node.children.splice(-1,0,fieldSyntaxClone);
    }
}

export function formatData(data:any){
    for (const key in data){
        if (skipKey(key)){
            continue;
        }

        switch(g_syntax[key].type){
            case "array":
                formatArray(data, key)
                break;
            case "object":
                formatObject(data, key)
                break;
            case "field":
                formatField(data, key)
                break;
        }
    }
    }
