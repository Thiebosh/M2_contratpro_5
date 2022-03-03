class AddingNode extends Node {
    constructor(parent){
        super("+", parent);
    }

    click() {
        let screenNode = new ObjectNode("Screen " + (this.parent.children.length), this.parent)
        screenNode.path = this.parent.path.concat("_",String(this.parent.children.length - 1));
        this.parent.children.splice(-1, 0, screenNode);
        this.update(this.parent);
        let node = d3.select("#" + screenNode.path);
        node.select("text")
        .text(this.parent.children.length - 1)
        .attr("text-anchor", "middle");
        node.on("click", function(node){
            this.editNode(node);
        }.bind(this));
    }

    
}