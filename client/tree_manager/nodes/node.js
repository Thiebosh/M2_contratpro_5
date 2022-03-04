
class Node {
    constructor(name, parent= null){
        this.name = name;
        this.children = [];
        this.parent = parent;
        this.path = parent == null ? "root" : parent.path + "_" + name;
        this.root = parent == null ? this : parent.root;
        this.depth = parent == null ? 0 : this.parent.depth + 1 ;
        this.pd = null;

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
        return child;
    }

    addObjectChild(name){
        let child = new ObjectNode(name, this);
        this.addChildToChildren(child);
        return child;
    }

    addAddingChild(){
        let child = new AddingNode(this);
        if (!this.children) {
            this.children = [];
        }
        this.children.splice(-1, 0, child);
        return child;
    }

    click(){
    }

    editNode(node){
        $("#nodeNameInput").val("");
        $("#nodeNameInput").attr("placeholder", node.name);
        $("#nodeNameInput").on("keypress", function(e){
            if(e.keyCode == 13){
                $("#nodeNameInput").blur();
                this.saveNodeName(node);
                $("#nodeNameInput").off("keypress");
            }
        }.bind(this));
        $("#nodeSettings").attr("nodeId", node.path);
        $("#nodeSettings").modal("show");
    }

    saveNodeName(node){
        node.name = $("#nodeNameInput").val();
        d3.select("#" + node.path).select("text").text(node.name);
        $("#nodeSettings").modal("hide");
    }

    getPreviousOneByDepthAndPos(nodesDict, depth, index){
        var nodesOnSameDepth = []
        $(".node[depth='"+depth+"']").each(function(i, n){
            nodesOnSameDepth.push(n)
        })
        return nodesDict[nodesOnSameDepth[index-1].id].pd.x;
    }

    update(source) {
        // Compute the new tree layout. 
        var treeData = tree(this.root.hierarchy);
        var nodes = treeData.descendants(),
            links = treeData.descendants().slice(1);
        // Normalize for fixed-depth.
        var nodesDict = {}
        nodes.forEach(function(d) {
            nodesDict[d.data.path] = d.data;
            d.data.pd = d;
            d.y = d.depth * 180;});
        // Update the nodes…
        var node = svg.selectAll("g.node")
        .data(nodes, function(d) {return d.id || (d.id = ++i); });
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
        .attr("class", function(d){
            let objectName = d.data.constructor.name;
            return "node " + objectName.charAt(0).toLowerCase() + objectName.slice(1);
        })
        .attr("id", function(d){return d.data.path})
        .attr("depth", function(d){return d.depth})
        .attr("transform", function(d) {return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", function(e,d){d.data.click(d.parent);});
        
        nodeEnter.append("circle")
        .attr("class", "node")
        // .attr("r", function(d){
        //     return d.data.constructor.name == "AddingNode" ? 10 : 30;
        // })
        .attr("r", 30)
        .style("fill", function(d) { "#fff"; });
        
        
        nodeEnter.append("text")
        .text(function(d){return d.data.name;})
        .attr("text-anchor", "middle");

        var currentDepth = 0;
        var currentIndex = 0;
        var nodeUpdate = nodeEnter.merge(node);
        // Transition nodes to their new position.
        nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function(d) {
            if (d.depth != currentDepth){
                currentDepth += 1;
                currentIndex = 1;
            } else{
                if(currentIndex > 0){
                    let x = this.getPreviousOneByDepthAndPos(nodesDict, currentDepth, currentIndex);
                    if (d.x < x+60){
                        d.x = x + 60;
                    }
                }
                currentIndex += 1;
            }
            return "translate(" + d.y + "," + d.x + ")"; }.bind(this));
        
        
        nodeUpdate.select("circle")
        .attr("r", 30)
        // .attr("r", function(d){
        //     return d.data.constructor.name == "AddingNode" ? 10 : 30;
        // })
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
        .data(links, function(d) { return d.id; });
        
        // Enter any new links at the parent's previous position.
        var linkEnter = link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("d", function(d) {
            var o = {x: source.x0, y: source.y0};
            return this.diagonal(o, o);
        }.bind(this));
        
        var linkUpdate = linkEnter.merge(link);
        
        // Transition links to their new position.
        linkUpdate.transition()
        .duration(duration)
        .attr("d", function(d){return this.diagonal(d,d.parent)}.bind(this));
        
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
        .duration(duration)
        .attr("d", function(d) {
            var o = {x: source.x, y: source.y};
            return this.diagonal(o, o);
        }.bind(this))
        .remove();
        
        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
            d.data.x = d.x;
            d.data.y = d.y;
            d.data.x0 = d.x;
            d.data.y0 = d.y;
        });
    }
    
    diagonal(s, d) {
        let path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`

        return path
    }
}