import Tree from "react-d3-tree"
import data from "./example.json"
import clone from "clone";
import { useState } from "react";

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
    return (
        <div id="treeContent" style={{width: '1500px', height: '1000px'}}>
            <Tree
                data={tree}
                translate={{x:750,y:500}}
                onNodeClick={(nodeData:any) => {
                    if (nodeData.data.type === "adding"){
                        const nextData:any = clone(tree)
                        const target = nextData[0].children;
                        target.push({
                            name:"new",
                            type:"array",
                            children:[{
                                name:"1",
                                type:"object"

                            }
                            ]
                        });
                        setTree(nextData)
                    }
                }}
            />
        </div>
        )
}

function formatData(node:any){
    Object.keys(node).map((key) => {
        console.log(node[key])
        console.log(Array.isArray(node[key]))
        // formatData(elem[key]);
    })

    // //Reprendre les 2 fonctions suivantes et les adapter
    // function rec(syntax, node, parentNode){
    //     for (const key in node){
    //         if (Array.isArray(node[key])){ //On rencontre un JSON Array
    //             let arrayNode = parentNode.addArrayChild(key);
    //             for (let i = 0; i < node[key].length; i++){
    //                 let arrayChildNode = arrayNode.addObjectChild(arrayNode.children.length)
    //                 rec(syntax, node[key][i], arrayChildNode)
    //                 arrayChildNode.children.push(arrayChildNode.children.splice(0,1)[0]) //On place le "+" en dernier enfant
                    
    //             }
    //             arrayNode.children.push(arrayNode.children.splice(0,1)[0]) //On place le "+" en dernier enfant
    //         } else if (typeof node[key] === "object"){ //On rencontre un JSON Object
    //             let objectNode = parentNode.addObjectChild(key);
    //             rec(syntax, node[key], objectNode);
    //             objectNode.children.push(objectNode.children.splice(0,1)[0]) //On place le "+" en dernier enfant

    //         } else { //On rencontre une string (on arrive au bout de la branche de l'arbre)
    //         }
    //     }
    // }

    // function createTreeFromJson(json){
    // 	$.getJSON("../syntax/syntax.json", function(syntax){
    //         $.getJSON("json/example.json",function(json){
    //             root = new MainNode();
    //             // root.addArrayChild("Screen");
    //             // root.addObjectChild("test").addArrayChild("fds")
    //             rec(syntax, json["root"], root)
    //             root.hierarchy = d3.hierarchy(root, function(d){return d.children;});
    //             root.update(root)
    //         });
    // 	});

    // }
}
