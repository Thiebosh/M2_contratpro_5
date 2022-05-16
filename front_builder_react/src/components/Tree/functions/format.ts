import clone from "clone";
import {
    initChildrenIfNotDone,
    skipKey
} from "./utils"
import { addAddingNode } from "./node"

function formatArray(data:any, key:string, syntax:any){
    initChildrenIfNotDone(data); // to add children of current data as value of children key

    for (let i = 0; i < data[key].length; i++){
        initChildrenIfNotDone(data[key][i]); // to add adding node as child of all the children of the array
        addAddingNode(data[key][i]);

        data[key][i].name = key;
        data.children.splice(-2,0,data[key][i]);
        formatData(data[key][i], syntax);
    }
}

function formatObject(data:any, key:string, syntax:any){
    data[key].name = key;

    initChildrenIfNotDone(data);
    initChildrenIfNotDone(data[key]); // same as for formatArray
    
    addAddingNode(data[key]);

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