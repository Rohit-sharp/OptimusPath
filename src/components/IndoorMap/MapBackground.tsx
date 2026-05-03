import floor1 from "@/assets/img/floor-1.svg";
import floor2 from "@/assets/img/floor-2.svg";
import { ReactNode } from "react";

interface MapBackgroundProps {
  children: ReactNode;
  currentFloor: number;
}

const floorMaps: { [key: number]: string } = {
  1: floor1,
  2: floor2,
};

function MapBackground({ children, currentFloor }: MapBackgroundProps) {
  const floorSvg = floorMaps[currentFloor] || floor1;

  return (
    <svg
      viewBox="0 0 1200 800"
      className="lg:h-[85vh] lg:w-[75vw] h-[85dvh]"
    >
      <image id="background" width="100%" height="100%" href={floorSvg} />
      {children}
    </svg>
  );
}

export default MapBackground;
