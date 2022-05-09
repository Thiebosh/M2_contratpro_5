import Tree from "react-d3-tree"
import clone from "clone";
import { useEffect, useState } from "react";

// la doc : https://bkrem.github.io/react-d3-tree/docs/interfaces/_tree_types_.treeprops.html
const debugData = [
    {
      name: "root",
      children: [
        {
          name: "screen",
          type:"array",
          children:[
              {
                  name:"0",
                  type:"object",
              },
              {
                  name:"1",
                  type:"object"
              },
              {
                  name:"+",
                  type:"adding"
              }
          ]
        }
      ]
    }
];

// var state:any = {
//     data: debugData
// }
export function CustomTree(){
    // formatData(data)
    const [tree, setTree] = useState<any>(debugData);

    useEffect(() => {
        getDataFromJson()
        .then((d => init(d, setTree)));
    }, [])

    return (
            <Tree
                data={tree}
                translate={{x:window.innerWidth*1/4,y:window.innerHeight/2}}
                transitionDuration={0.5}
                onNodeClick={(nodeData:any) => {
                    if (nodeData.data.type === "adding"){
                        console.log(nodeData) 
                        //nodeData = juste en accès, uniquement pour récup infos, pas pour modifier
                        const nextData:any = clone(tree)
                        if (nodeData.parent.data.type === "array"){
                            addChild(nextData[0], nodeData.parent.data.name)
                            // nodeData.parent.children.push({
                            //     name:"newObject",
                            //     type:"object"
                            // })
                        }
                        // const target = nextData[0].children;
                        // target.push({
                        //     name:"new",
                        //     type:"array",
                        //     children:[{
                        //         name:"1",
                        //         type:"object"

                        //     }
                        //     ]
                        // });
                        setTree(nextData)
                    }
                }}
            />
    )
}

function addChild(node:any, name:any){
    if (node.children){
        if(node.name === name){
            node.children.splice(-1,0,{
                name:"fd"
            })
        } else{
            node.children.forEach((o: any) => addChild(o,name))
        }

    }
}

function init(data:any, setTree:any){
    // console.log(data["root"])
    // data["root"].children = data["root"];
    // data["root"].name = "root";
    // console.log(data["root"])

    formatData(data["root"]);
    data = [data["root"]]
    data.name = "root"
    setTree(data)
}

function getDataFromJson(){
    return fetch("/example.json").then(data => {
        // fetch("/syntax.json").then(syntaxTree => syntaxTree.json())
        // console.log(data.json())
        return data.json()

    })
    // fetch("/example.json").then((data:any,jsonData:any) =>  data.json())

}


function formatData(data:any){
    for (const key in data){
        if (Array.isArray(data[key])){ // if it's an array
            for (let i = 0; i < data[key].length; i++){
                data[key][i].name = key
                data[key][i].type = "array"
                if (!data.children){
                    data.children = []
                }
                data.children.push(data[key][i])
                if (i === data[key].length -1 ){
                    data.children.push({
                        name:"+",
                        type:"adding"
                    })
                }
                formatData(data[key][i]);
            }
        } else if (typeof data[key] != "string"){ // if it's and object
            data[key].name = key
            data[key].type = "object"
            if (!data.children){
                data.children = []
            }
            data.children.push(data[key])
            // data.children.push({ // WIP : there is an extra "+" after style nodes
            //     name:"+",
            //     type:"adding"
            // })
            formatData(data[key]);
        } else { // if it's a string

        }
    }
}
