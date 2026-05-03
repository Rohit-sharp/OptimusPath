interface FloorSelectorProps {
  currentFloor: number;
  onFloorChange: (floor: number) => void;
}

function FloorSelector({ currentFloor, onFloorChange }: FloorSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-medium">Floor:</span>
      <div className="flex rounded overflow-hidden border border-gray-300">
        <button
          className={`px-3 py-1 text-sm font-medium transition-colors ${
            currentFloor === 1
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onFloorChange(1)}
        >
          1
        </button>
        <button
          className={`px-3 py-1 text-sm font-medium transition-colors border-l border-gray-300 ${
            currentFloor === 2
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          onClick={() => onFloorChange(2)}
        >
          2
        </button>
      </div>
    </div>
  );
}

export default FloorSelector;
