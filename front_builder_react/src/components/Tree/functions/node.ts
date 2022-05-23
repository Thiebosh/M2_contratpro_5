import { initChildrenIfNotDone, isStringNumber, removeElementFromArrayWithPath } from "./utils"
import { g_syntax } from "../Tree"
import clone from "clone";

export function addAddingNode(data:any){
    const addingNode = {
        syntaxKey:"+",
        type:"adding",
        parent:data,
        path:data.path + "/adding"
    };

    data.children.push(addingNode);
}

export function findNodeWithPathForCreate(path:string, data:any, setTree:React.Dispatch<any>, i:number=0){
    //@ts-ignore
    const splittedPath = path.split("/");
    const nextSubPath = splittedPath[i+1]

    if (i < splittedPath.length - 2){
        findNodeWithPathForCreate(path, data[nextSubPath], setTree, i+1);
    } else {
        addChildren(data, nextSubPath, setTree);
        return data;
    }
}

export function addChildren(nodeData:any, suggestion:any, setTree:React.Dispatch<any>, socket?:any){
    // suggestion = selected new node
    const values = g_syntax[suggestion].values;
    let node;
    let parent = nodeData.type === "adding" ? nodeData.parent : nodeData;
    let jsonContent;
    let initArray = false;
    if (values){
        initChildrenIfNotDone(parent);
        node = initNewNode(suggestion, parent)

        if (g_syntax[node.syntaxKey].type === "array" && !parent[node.syntaxKey]){
            initArray = true;
        }

        jsonContent = createMandatoryChildren(node);
        
        addNewNodeAsValueInNodeData(node);
        parent.children.splice(-1,0,node);
        addAddingNode(node);
        updateNodeChildren(node.parent, setTree);
    } else {
        node = initNewNode(suggestion, parent)
    
        if (g_syntax[node.syntaxKey].type === "array" && !parent[node.syntaxKey]){
            initArray = true;
        }

        jsonContent = createMandatoryChildren(node);

        addNewNodeAsValueInNodeData(node);
        parent.children.splice(-1,0,node);
        updateNodeChildren(node.parent, setTree);
    }

    

    if (socket){
        //@ts-ignore
        const splittedPath = node.path.split("/");
        let jsonPath = splittedPath.slice(0, -1).join("/");
       if(initArray){
            socket.send(JSON.stringify(
                {
                    action:"create",
                    path:jsonPath.split("/").slice(0, -1).join("/"),
                    content:{[node.syntaxKey]: [jsonContent]}
                }
            )); //if array doesn't exist as child of the node the path stop at the parent and the content contains mandatory children
            // in brackets to create the array and insert node inside
        } else {
            if (g_syntax[node.syntaxKey].type !== "array" && Object.keys(jsonContent).length === 0){
                jsonContent[node.syntaxKey] = {};
            } // If not array and jsonContent empty, we have to put the syntaxKey as key in the content json because it has
            // to be present in the websocket, and it is not in the path because we stop at the parent

            if (g_syntax[node.syntaxKey].type === "field"){ 
                /*to init creation of new field : for field, content contains only key with value that we init in the following line
                for array, content contains mandatory children
                for object : content contains json and not only one key-value*/
                jsonContent[splittedPath[splittedPath.length - 1]] = "";
            } 
            socket.send(JSON.stringify(
                {
                    action:"create",
                    path:jsonPath,
                    content:jsonContent
                }
            ))
        }
    }
}

function getChildWithPath(data:any, path:any){
    const children = data.children;
    for(let i = 0; i < children.length; i++){
        if(children[i].path === path){
            return children[i];
        }
    }
}

//@ts-ignore
function findNodeWithPathForUpdate(path:string, data:any, i:number=0){
    const splittedPath = path.split("/");

    if (i < splittedPath.length - 1){
        const nextSubPath = splittedPath[i+1]

        if(!isStringNumber(nextSubPath)){
        /*if current path element isn't an index, we check if it's a field if yes : means
        that we have to get node in children because in the node data, the value of the key isn't a JSON : it's the input value*/
            if(g_syntax[nextSubPath].type === "field"){
                return getChildWithPath(data, path);
            }
        }

        return findNodeWithPathForUpdate(path, data[nextSubPath], i+1);
    } else {
        return data;
    }
}

export function updateValueOnNode(value:any, path:string, data:any, setTree:React.Dispatch<any>, socket?:any){
    path = path.split("_")[0]; //get real path because given path is suffixed with "_" and type of element (e.g : "_input")

    const node = findNodeWithPathForUpdate(path, data);
    node.value = value;
    node.parent[node.syntaxKey] = value;
    updateNodeChildren(node, setTree);
    if(socket){
        socket.send(JSON.stringify(
            {
                action:"update",
                //@ts-ignore
                path:node.path,
                content:value
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
    const parent = node.parent;
    const syntaxKey = node.syntaxKey;
    if (g_syntax[syntaxKey].type === "array" && !parent[syntaxKey]){
        parent[syntaxKey] = [];
    }
    if (parent[syntaxKey]){ // if array
        parent[syntaxKey].push(node);
    } else {
        if (g_syntax[syntaxKey].type === "field"){ // if field, we init with empty value
            parent[syntaxKey] = "";
        } else { // else, it contains values of the node
            parent[syntaxKey] = node;
        }
    }
}

function createMandatoryChildren(node:any, content:any={}){
    if(hasMandatoryValues(node)){

        g_syntax[node.syntaxKey].values.forEach((val:any) => {
            if (val[0] !== "?"){
                const newNode = initNewNode(val, node);
                node[val] = g_syntax[val].type === "field" ? "" : newNode; 
                //If field, value is empty (fields don't have json as value), else it contains the json

                if (g_syntax[node.syntaxKey].type === "array"){
                    content[val] = node[val];
                } else {
                    if (!(node.syntaxKey in content)){
                        content[node.syntaxKey] = {};
                    }
                    content[node.syntaxKey][val] = node[val];
                }
                node.children.push(newNode);
                createMandatoryChildren(newNode, content);
            }
        });
    }
    return content;
}

function initNewNode(suggestion:any, parent:any){
    if (g_syntax[suggestion].type === "field"){ // if field, we have a different syntax of the node
        const fieldSyntax = g_syntax[g_syntax[suggestion].field];
        let nodeSyntax = {
            syntaxKey:suggestion,
            type:fieldSyntax.type,
            parent:parent,
            path:parent.path + "/" + suggestion
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
    let path = parent.path + "/";
    if (g_syntax[suggestion].type === "array"){
        path+= suggestion + "/" + (parent[suggestion] === undefined ? 0 : parent[suggestion].length);
    } else {
        path += suggestion;
    }
    return {
        syntaxKey:suggestion,
        children:[],
        parent:parent,
        path:path
    }
}


function updateNodeChildren(node:any, setTree:React.Dispatch<any>){
    let currentParent;

    if (node.parent) {
        currentParent = node.parent;
        
        while (currentParent.syntaxKey !== "root"){
            currentParent = currentParent.parent;
        }
    }
    setTree(currentParent ? clone(currentParent) : clone(node));
}

//@ts-ignore
function findNodeWithPathForDelete(path:string, data:any, i:number=0){
    const splittedPath = path.split("/");
    const nextSubPath = splittedPath[i+1]
    if (i < splittedPath.length - 1){
        return findNodeWithPathForDelete(path, data[nextSubPath], i+1);
    } else {
        return data;
    }
}

export function deleteNode(path:any, data:any, setTree:React.Dispatch<any>, socket?:any){
    const node = findNodeWithPathForDelete(path,data);
    if (g_syntax[node.syntaxKey].type === "array"){
        removeElementFromArrayWithPath(node.parent[node.syntaxKey], path);
    } else {
        delete node.parent[node.syntaxKey];
    }
    removeElementFromArrayWithPath(node.parent.children, path);
    
    updateNodeChildren(node.parent,setTree);

    if(socket){
        socket.send(JSON.stringify({
            action:"delete",
            path:node.path.split("/").slice(0, -1).join("/"),
            content:node.path.split("/")[node.path.split("/").length - 1]
        }))
    }
}
