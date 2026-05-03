import { graphData } from "@/store/graphData";

interface ObjectsProps {
  handleObjectClick: (e: React.MouseEvent<SVGPathElement>) => void;
  className?: string;
  currentFloor: number;
}

function Objects({ handleObjectClick, className, currentFloor }: ObjectsProps) {
  // get named vertices on current floor but skip elevator nodes
  const floorObjects = graphData.vertices.filter(
    (v) => v.floor === currentFloor && v.objectName !== null && !v.id.includes("elev")
  );

  return (
    <g id="Objects">
      {floorObjects.map((vertex) => (
        <rect
          key={vertex.id}
          id={vertex.objectName || vertex.id}
          x={vertex.cx - 80}
          y={vertex.cy - 40}
          width={160}
          height={80}
          rx={4}
          className={`${className} object`}
          onClick={handleObjectClick}
        />
      ))}
    </g>
  );
}

export default Objects;
