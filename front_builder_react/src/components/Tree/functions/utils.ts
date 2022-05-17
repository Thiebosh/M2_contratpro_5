export function initChildrenIfNotDone(data:any){
    if (!data.children){
        data.children = []
    }
}

export function skipKey(key:string){
    const keysToSkip = ["syntaxKey", "children", "parent"]
    return keysToSkip.includes(key)
}

export function moveElementAtFirstPosition(array:any, element:any){
    const selectedElemIndex = array.indexOf(element);
    array.splice(selectedElemIndex,1);
    array.splice(0,0,element);
}