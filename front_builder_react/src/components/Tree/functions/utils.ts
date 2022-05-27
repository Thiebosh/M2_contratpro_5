export function initChildrenIfNotDone(data:any){
    if (!data.children){
        data.children = [];
        data._children = []
    }
}

export function skipKey(key:string){
    const keysToSkip = ["syntaxKey", "children", "_children", "parent", "path"]
    return keysToSkip.includes(key)
}

export function moveElementAtFirstPosition(array:any, element:any){
    const selectedElemIndex = array.indexOf(element);
    array.splice(selectedElemIndex,1);
    array.splice(0,0,element);
}

export function isStringNumber(str:string){
    return !isNaN(parseInt(str));
}

export function removeElementFromArrayWithPath(array:any, path:any){
    let i = 0;
    array.forEach((child:any) => {
        if (child.path === path){
            array.splice(i, 1);
        }
        i++;
    });
}

export function isStringBoolean(str:string){
    return str === "false" || str === "true";
}