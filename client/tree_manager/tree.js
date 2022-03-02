$(function () {
    // ************** Generate the tree diagram	 *****************
    margin = {top: 20, right: 120, bottom: 20, left: 120};
    width = 960 - margin.right - margin.left;
    height = 500 - margin.top - margin.bottom;

    i = 0;
    duration = 500;
    root;

    tree = d3.layout.tree()
    .size([height, width]);

    diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

    svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
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

    function nodeType(elem){
        console.log(elem);
    }

    function rec(syntax, node, parentNode){
        for (const key in node){
            // console.log("KEY " + key)
            // console.log(node)
                if (Array.isArray(node[key])){ //On rencontre un JSON Array
                    let arrayNode = parentNode.addArrayChild(key);
                    // console.log(arrayNode)
                    for (let i = 0; i < node[key].length; i++){
                        // nodeType(node[key][i]);
                        rec(syntax, node[key][i], arrayNode)
                    }
                } else if (typeof node[key] === "object"){ //On rencontre un JSON Object
                    let objectNode = parentNode.addObjectChild(key);
                    // nodeType(node[key])
                    rec(syntax, node[key], objectNode);
                } else{ //On rencontre une string (on arrive au bout de la branche de l'arbre)
                    nodeType(node[key])
                }
        }
    }

    function createTreeFromJson(json){
    	$.getJSON("../syntax/syntax.json", function(syntax){
    		// console.log(data)
            $.getJSON("json/example.json",function(json){
                // console.log(syntax);
                // console.log(json);
                root = new MainNode();
                // console.log(Object.keys(json["root"]))
                rec(syntax, json["root"], root)
            });
    	});
    	// $.getJSON("json/example.json",function(json){
    	// 	root = new MainNode();

    	// 	console.log(json[Object.keys(json)[0]]);
    	// })

    }
    createTreeFromJson("");
    // test = new MainNode();
    // screens = test.addArrayChild("Screen");
});
