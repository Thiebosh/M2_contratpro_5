$(function () {
    // ************** Generate the tree diagram	 *****************
    margin = {top: 20, right: 120, bottom: 20, left: 120};
    width = 1500;
    height = 1000;

    i = 0;
    duration = 500;
    root;

    tree = d3.tree()
    // .nodeSize([30,])
    // .separation(function separation(a, b) { 
    //     return a.parent == b.parent ? 5 : 1;
    // })
    .size([height, width]);

    // diagonal = d3.svg.diagonal()
    // .projection(function(d) { return [d.y, d.x]; });

    svg = d3.select("#treeContent")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function (event) {
            svg.attr("transform", event.transform)
         }))
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // treeData = [
    // 	{
    // 		"name" : "Root",
    // 		"parent" : "null",
    // 		"path":"root",
    // 		"children" : [
    // 			{
    // 			"name":"Screens",
    // 			"parent":"Root",
    // 			"path":"root_screens",
    // 			"children": []
    // 			}
    // 		]
    // 	}
    // ]
    // root = treeData[0];
    // root.x0 = height/2;
    // root.y0 = 0;

    // update(root);

    function rec(syntax, node, parentNode){
        for (const key in node){
            if (Array.isArray(node[key])){ //On rencontre un JSON Array
                let arrayNode = parentNode.addArrayChild(key);
                for (let i = 0; i < node[key].length; i++){
                    let arrayChildNode = arrayNode.addObjectChild(arrayNode.children.length)
                    rec(syntax, node[key][i], arrayChildNode)
                    arrayChildNode.children.push(arrayChildNode.children.splice(0,1)[0]) //On place le "+" en dernier enfant
                    
                }
                arrayNode.children.push(arrayNode.children.splice(0,1)[0]) //On place le "+" en dernier enfant
            } else if (typeof node[key] === "object"){ //On rencontre un JSON Object
                let objectNode = parentNode.addObjectChild(key);
                rec(syntax, node[key], objectNode);
                objectNode.children.push(objectNode.children.splice(0,1)[0]) //On place le "+" en dernier enfant

            } else { //On rencontre une string (on arrive au bout de la branche de l'arbre)
            }
        }
    }

    function createTreeFromJson(json){
    	$.getJSON("../syntax/syntax.json", function(syntax){
            $.getJSON("json/example.json",function(json){
                root = new MainNode();
                // root.addArrayChild("Screen");
                // root.addObjectChild("test").addArrayChild("fds")
                rec(syntax, json["root"], root)
                root.hierarchy = d3.hierarchy(root, function(d){return d.children;});
                root.update(root)
            });
    	});

    }
    createTreeFromJson("");
});
