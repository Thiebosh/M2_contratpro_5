export function addAddingNode(data:any){
    const addingNode = {
        name:"+",
        type:"adding",
        parent:data
    }
    data.children.push(addingNode)
}