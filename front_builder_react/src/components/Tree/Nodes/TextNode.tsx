import './styles.scss';
import {deleteNode} from "./../functions/node"

export default function TextNode({ nodeDatum, tree, setTree, socket}: {nodeDatum: any, tree:any, setTree: React.Dispatch<any>, socket:any}) {
    return (
      <g className={nodeDatum.path} onClick={() => deleteNode(nodeDatum.path, tree, setTree, socket)}>
        <circle r="25" />
        <text fill="white" textAnchor="middle">
          {nodeDatum.syntaxKey}
        </text>
      </g>
    )
}
