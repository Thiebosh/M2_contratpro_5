class AddingNode extends Node {
    constructor(parent){
        super("+", parent);
    }

    adjustDepth(pd){
        if (pd.children){
            for (let i = 0; i <pd.children.length; i++){
                pd.children[i].depth = pd.data.depth +1;
                this.adjustDepth(pd.children[i]);
            }
        }
    }

    click(parent) {
        let screenNode = new ObjectNode("Screen " + (this.parent.children.length), this.parent)
        screenNode.path = this.parent.path.concat("_",String(this.parent.children.length - 1));
        this.parent.children.splice(-1, 0, screenNode);

        var newNode = d3.hierarchy(screenNode);
        this.adjustDepth(newNode)

        newNode.parent = parent;
        newNode.depth = screenNode.depth;
        parent.children.splice(-1,0, newNode);
        this.update(this.parent.pd);

        let node = d3.select("#" + screenNode.path);
        node.select("text")
        .text(this.parent.children.length - 1)
        .attr("text-anchor", "middle");
        node.on("click", function(node){
            this.editNode(node);
        }.bind(this));
    }

    
}