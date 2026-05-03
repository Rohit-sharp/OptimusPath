import IndoorMapWrapper from "@/components/IndoorMapWrapper";
import MobileRouteDetails from "@/components/MobileRouteDetails";
import Toolbar from "@/components/Toolbar";
import { createContext, useEffect, useState } from "react";
import { isDesktop, isMobile } from "react-device-detect";
import { useSearchParams } from "react-router-dom";
import {
  MapDataContextType,
  Navigation,
  NavigationContextType,
  ObjectItem,
  Category,
} from "../utils/types";
import Sidebar from "@/components/Sidebar";
import db from "@/assets/db.json";

export const NavigationContext = createContext<NavigationContextType | null>(
  null
);
export const MapDataContext = createContext<MapDataContextType | null>(null);
function Map() {
  let [searchParams, setSearchParams] = useSearchParams();
  const DEFAULT_POSITION = "f1_v5";
  const startPosition = searchParams.get("position") || DEFAULT_POSITION;
  const [navigation, setNavigation] = useState<Navigation>({
    start: startPosition,
    end: "",
  });
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentFloor, setCurrentFloor] = useState<number>(1);

  const navigationValue: NavigationContextType = {
    navigation,
    setNavigation,
    isEditMode,
    setIsEditMode,
    currentFloor,
    setCurrentFloor,
  };
  const categories: Category[] = db.categories;
  const objects = (): ObjectItem[] => {
    const objectsData: ObjectItem[] = db.objects;
    objectsData.forEach((obj) => {
      obj.categoryName = categories.find(
        (cat) => cat.id === obj.categoryId
      )?.name;
    });
    return objectsData;
  };

  useEffect(() => {
    setSearchParams({ position: navigation.start });
  }, [navigation.start]);

  const mapData = { objects: objects(), categories };
  return (
    <MapDataContext.Provider value={mapData}>
      <NavigationContext.Provider value={navigationValue}>
        <div className="flex bg-gray-100 text-gray-800 relative w-full h-screen overflow-hidden">
          {isDesktop && <Sidebar />}
          <main
            className={`flex w-full ${isDesktop && "-ml-96"} justify-center flex-col md:p-6 p-2 transition-all duration-150 ease-in lg:ml-0 overflow-hidden h-screen`}
          >
            <div className="flex-shrink-0">
              <Toolbar />
            </div>
            <div className="center w-full flex-1 min-h-0 overflow-hidden">
              <IndoorMapWrapper />
            </div>
          </main>
          {navigation.end && isMobile && <MobileRouteDetails />}
        </div>
      </NavigationContext.Provider>
    </MapDataContext.Provider>
  );
}

export default Map;
