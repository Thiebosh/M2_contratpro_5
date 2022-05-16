export function initChildrenIfNotDone(data:any){
    if (!data.children){
        data.children = []
    }
}

export function skipKey(key:string){
    const keysToSkip = ["name", "children", "parent"]
    return keysToSkip.includes(key)
}