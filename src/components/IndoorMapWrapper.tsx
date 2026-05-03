import React, { useContext, useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { MapDataContext, NavigationContext } from "../pages/Map";
import {
  MapDataContextType,
  NavigationContextType,
  ObjectItem,
} from "../utils/types";
import { MapBackground, Paths, Positions, Objects } from "./IndoorMap";

import Controls from "./MapControls";
import ObjectDetailsModal from "./ObjectDetailsDialog";
import { navigateToObject, drawPathForFloor, lastCalculatedPath } from "@/utils/navigationHelper";
import { toast } from "react-toastify";

function IndoorMapWrapper() {
  const [modalOpen, setModalOpen] = useState(false);
  const [object, setObject] = useState<ObjectItem>({} as ObjectItem);
  const positionRadius = isMobile ? 10 : 8;
  const { navigation, setNavigation, isEditMode, setIsEditMode, currentFloor, setCurrentFloor } = useContext(
    NavigationContext
  ) as NavigationContextType;
  const { objects } = useContext(MapDataContext) as MapDataContextType;

  useEffect(() => {
    if (lastCalculatedPath.length > 0 && navigation.end) {
      setTimeout(() => {
        drawPathForFloor(lastCalculatedPath, currentFloor);
      }, 100);
    }
  }, [currentFloor]);

  async function handleObjectClick(e: React.MouseEvent<SVGPathElement>) {
    if (!isEditMode) {
      const targetId = (e.target as HTMLElement).id;

      // check if they clicked on the elevator area in the SVG background
      if (targetId.toLowerCase().includes("elevator")) {
        const otherFloor = currentFloor === 1 ? 2 : 1;
        setCurrentFloor(otherFloor);
        return;
      }

      const selectedObject = objects.find((obj) => obj.name === targetId);
      if (selectedObject?.id) {
        setObject(selectedObject);
        setModalOpen(true);
      } else {
        toast.error("Object not found");
      }
    }
  }
  const handlePositionClick = (e: React.MouseEvent<SVGPathElement>) => {
    if (isEditMode) {
      const vertexId = (e.target as HTMLElement).id;
      setNavigation({ start: vertexId });
      setIsEditMode(false);
    }
  };

  function handleNavigationClick() {
    setModalOpen(false);
    navigateToObject(object.name, navigation, setNavigation, setCurrentFloor);
  }
  return (
    <div className="relative w-full h-full bg-white center overflow-hidden">
      <ObjectDetailsModal
        open={modalOpen}
        object={object}
        onClose={() => setModalOpen((cur) => !cur)}
        objectNavigation={handleNavigationClick}
      />

      <TransformWrapper
        centerOnInit
        minScale={isMobile ? 0.4 : 1}
        doubleClick={{ mode: "reset" }}
        initialScale={isMobile ? 0.4 : 1}
        smooth={true}
        wheel={{ smoothStep: 0.01 }}
      >
        <TransformComponent wrapperClass="bg-white">
          <MapBackground currentFloor={currentFloor}>
            <Objects
              handleObjectClick={handleObjectClick}
              className={
                isEditMode ? "" : "hover:cursor-pointer hover:opacity-50"
              }
              currentFloor={currentFloor}
            />
            <Paths currentFloor={currentFloor} />
            <Positions
              positionRadius={positionRadius}
              handlePositionClick={handlePositionClick}
              className={
                isEditMode
                  ? "opacity-100 cursor-pointer hover:fill-[#488af4] "
                  : "opacity-0"
              }
              navigation={navigation}
              currentFloor={currentFloor}
            />
          </MapBackground>
        </TransformComponent>
        <Controls />
      </TransformWrapper>
    </div>
  );
}
export default IndoorMapWrapper;
