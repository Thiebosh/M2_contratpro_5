export function initChildrenIfNotDone(data:any){
    if (!data.children){
        data.children = []
    }
}

export function skipKey(key:string){
    const keysToSkip = ["syntaxKey", "children", "parent", "path"]
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