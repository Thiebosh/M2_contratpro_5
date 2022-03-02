$(function () {
        
    // ************** Generate the tree diagram	 *****************
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 500 - margin.top - margin.bottom;

    var i = 0,
    duration = 500,
    root;

    var tree = d3.layout.tree()
    .size([height, width]);

    var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("body").append("svg")
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











    class Node {
    constructor(name, parent= null){
        this.name = name;
        this.children = [];
        this.parent = parent;
        this.path = parent == null ? "root" : parent.path + "_" + name;
        this.root = parent == null ? this : parent.root;
        this.depth = parent == null ? 0 : this.parent.depth + 1 ;

    }

    addChildToChildren(child){
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    addArrayChild(name){
        let child = new ArrayNode(name, this);
        this.addChildToChildren(child);
        this.update(child.parent);
        return child;
    }

    addObjectChild(name){
        let child = new ObjectNode(name, this);
        this.addChildToChildren(child);
        this.update(child.parent);
        return child;
    }

    addAddingChild(){
        let child = new AddingNode(this);
        this.addChildToChildren(child);
        return child;
    }

    click(){
    }

    editNode(node){
        $("#nodeName").val("");
        $("#nodeName").attr("placeholder", node.name);
        $("#nodeName").on("keypress", function(e){
            if(e.keyCode == 13){
                $("#nodeName").blur();
                this.saveNodeName(node);
                $("#nodeName").off("keypress");
            }
        }.bind(this));
        $("#nodeSettings").attr("nodeId", node.path);
        $("#nodeSettings").modal("show");
    }

    saveNodeName(node){
        node.name = $("#nodeName").val();
        d3.select("#" + node.path).select("text").text(node.name);
        $("#nodeSettings").modal("hide");
    }

    update(source) {
        // Compute the new tree layout.
        var nodes = tree.nodes(this.root).reverse(),
            links = tree.links(nodes);
        // Normalize for fixed-depth.
        nodes.forEach(function(d) {d.y = d.depth * 180; });
        // Update the nodes…
        var node = svg.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
        .attr("class", function(d){return d.type ? "node " + d.type : "node"})
        .attr("id", function(d){return d.path})
        .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", function(d){d.click();});
        
        nodeEnter.append("circle")
        .attr("r", 30)
        .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });


        nodeEnter.append("text")
        .text(function(d){return d.name;})
        .attr("text-anchor", "middle");


        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", 30)
            .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);
            

        // Update the links…
        var link = svg.selectAll("path.link")
            .data(links, function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
        }


    }

    class MainNode extends Node {
    constructor(){
        super("Root");
        this.x0 = 250;
        this.y0 = 0;
        this.root = this;
    }
    }

    class AddingNode extends Node {
    constructor(parent){
        super("+", parent);
    }

    click() {
        let screenNode = new ObjectNode("Screen " + (this.parent.children.length), this.parent)
        screenNode.path = this.parent.path.concat("_",String(this.parent.children.length - 1));
        this.parent.children.splice(-1, 0, screenNode);
        this.update(this.parent)
        let node = d3.select("#" + screenNode.path);
        node.select("text")
        .text(this.parent.children.length - 1)
        .attr("text-anchor", "middle");
        node.on("click", function(node){
            this.editNode(node);
        }.bind(this));
    }
    }

    class ArrayNode extends Node {
    constructor(name, parent){
        super(name, parent);
        this.addAddingChild();
    }
    }

    class ObjectNode extends Node {
    constructor(name, parent){
        super(name, parent);
        this.addAddingChild();
    }
    }

    class FieldNode extends Node {
    constructor(name, parent){
        super(name, parent);
    }
    }

    // function createTreeFromJson(json){
    // 	let test  = $.getJSON("syntax/syntax.json", function(data){
    // 		console.log(JSON.stringify(data))
    // 	});
    // 	console.log(test);
    // 	$.getJSON("example.json",function(json){
    // 		root = new MainNode();

    // 		console.log(json[Object.keys(json)[0]]);
    // 	})

    // }
    // createTreeFromJson("");
    test = new MainNode();
    screens = test.addArrayChild("Screen");
});