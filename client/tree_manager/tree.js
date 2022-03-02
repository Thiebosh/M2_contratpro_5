$(function () {
    // ************** Generate the tree diagram	 *****************
    margin = {top: 20, right: 120, bottom: 20, left: 120};
    width = 1500;
    height = 1000;

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

    function rec(syntax, node, parentNode){
        for (const key in node){
            if (Array.isArray(node[key])){ //On rencontre un JSON Array
                let arrayNode = parentNode.addArrayChild(key);
                for (let i = 0; i < node[key].length; i++){
                    let arrayChildNode = arrayNode.addObjectChild()
                    rec(syntax, node[key][i], arrayChildNode)

                }
            } else if (typeof node[key] === "object"){ //On rencontre un JSON Object
                let objectNode = parentNode.addObjectChild(key);
                rec(syntax, node[key], objectNode);

            } else{ //On rencontre une string (on arrive au bout de la branche de l'arbre)
            }
        }
    }

    function createTreeFromJson(json){
    	$.getJSON("../syntax/syntax.json", function(syntax){
            $.getJSON("json/example.json",function(json){
                root = new MainNode();
                rec(syntax, json["root"], root)
            });
    	});

    }
    createTreeFromJson("");
});
