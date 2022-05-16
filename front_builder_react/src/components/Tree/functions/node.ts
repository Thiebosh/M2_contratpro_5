import { initChildrenIfNotDone } from "./utils"
import { root, g_setTree, g_syntax} from "../Tree"

export function addAddingNode(data:any){
    const addingNode = {
        name:"+",
        type:"adding",
        parent:data
    };

    data.children.push(addingNode);
}

export function addChildren(nodeData:any, suggestion:any){
    const values = g_syntax[suggestion].values;
    if (values){
        values.forEach((val:any) => {
            // if (val)
        })
        initChildrenIfNotDone(nodeData);
        addAddingNode(nodeData);
        // console.log(root);
        g_setTree(root);
    }
    // console.log(values)
    // nodeData.parent.children.splice(-1,0,{name:suggestion})
    // console.log(nodeData);
}