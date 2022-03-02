
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