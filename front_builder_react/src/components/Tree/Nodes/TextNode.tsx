import './styles.scss';

export default function TextNode({ nodeDatum }: {nodeDatum: any}) {
    return (
      <g className={nodeDatum.path}>
        <circle r="25" />
        <text fill="white" textAnchor="middle">
          {nodeDatum.syntaxKey}
        </text>
      </g>
    )
}
