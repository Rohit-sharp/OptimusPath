import { getDirectionSteps } from "@/algorithms/dijkstra";
import { lastCalculatedPath } from "@/utils/navigationHelper";

interface DirectionStepsProps {
  onFloorChange: (floor: number) => void;
}

function DirectionSteps({ onFloorChange }: DirectionStepsProps) {
  if (!lastCalculatedPath || lastCalculatedPath.length === 0) return null;

  const steps = getDirectionSteps(lastCalculatedPath);
  if (steps.length === 0) return null;

  // only show this component if route crosses floors
  const hasElevator = steps.some((s) => s.text.includes("Elevator"));
  if (!hasElevator) return null;

  return (
    <div className="bg-white rounded shadow-sm p-2 border border-gray-200 max-h-28 overflow-y-auto">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Directions</h3>
      <ul className="space-y-1">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="text-blue-500 font-bold mt-0.5">{idx + 1}.</span>
            <span
              className={`${
                step.text.includes("Elevator")
                  ? "text-amber-600 font-medium cursor-pointer hover:underline"
                  : "text-gray-700"
              }`}
              onClick={() => {
                if (step.text.includes("Elevator")) {
                  // parse floor number from the step text
                  const match = step.text.match(/Floor (\d)/);
                  if (match) {
                    onFloorChange(parseInt(match[1]));
                  }
                }
              }}
            >
              {step.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DirectionSteps;
