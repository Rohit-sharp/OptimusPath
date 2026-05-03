import { Dispatch, SetStateAction } from "react";
import { graph } from "../algorithms/dijkstra";
import { Navigation, NavigationContextType } from "./types";
import { ObjectItem } from "./types";
import { graphData } from "@/store/graphData";
import { toast } from "react-toastify";
export let routeLength = 0;
export let lastCalculatedPath: string[] = [];

const findVertexByObjectId = (vertexId: string) =>
  graphData.vertices.find((v) => v.objectName === vertexId);

export function navigateToObject(
  selectedObjectId: string,
  navigation: NavigationContextType["navigation"],
  setNavigation: NavigationContextType["setNavigation"],
  setCurrentFloor?: Dispatch<SetStateAction<number>>
) {
  const target = findVertexByObjectId(selectedObjectId);
  if (!target) {
    console.error("Target not found");
    toast.error("Target not found");
    return;
  }

  const shortestPath = graph.calculateShortestPath(navigation.start, target.id);
  lastCalculatedPath = shortestPath;

  if (shortestPath.length === 0) {
    toast.error("No route found");
    return;
  }

  // figure out which floor to show first
  // if route crosses floors we want to start on the floor the user is on
  const startVertex = graphData.vertices.find((v) => v.id === navigation.start);
  if (startVertex && setCurrentFloor) {
    setCurrentFloor(startVertex.floor);
  }

  // draw the path on the current floor
  drawPathForFloor(shortestPath, startVertex?.floor || 1);

  setNavigation((prevNavigation) => ({
    ...prevNavigation,
    end: selectedObjectId,
  }));
}

// draw the route path for a specific floor only
export function drawPathForFloor(path: string[], floor: number) {
  const floorNodes = path.filter((nodeId) => {
    const v = graphData.vertices.find((vert) => vert.id === nodeId);
    return v && v.floor === floor;
  });

  if (floorNodes.length < 2) {
    // nothing to draw on this floor, just clear it
    const navRoute = document.getElementById("navigation-route");
    if (navRoute) navRoute.setAttribute("d", "");
    return;
  }

  const firstNode = graphData.vertices.find((v) => v.id === floorNodes[0]);
  const pathString = floorNodes
    .slice(1)
    .map((vertexId) => {
      const vertex = graphData.vertices.find((v) => v.id === vertexId);
      return vertex ? `L${vertex.cx} ${vertex.cy}` : "";
    })
    .join(" ");

  const navigationRoutePath = document.getElementById("navigation-route");
  if (navigationRoutePath && firstNode) {
    navigationRoutePath.setAttribute(
      "d",
      `M${firstNode.cx} ${firstNode.cy} ${pathString}`
    );
    navigationRoutePath.classList.remove("path-once", "path-active");
    navigationRoutePath.classList.add("path-once");
    navigationRoutePath.addEventListener(
      "animationend",
      () => {
        navigationRoutePath.classList.remove("path-once");
        navigationRoutePath.classList.add("path-active");
      },
      { once: true }
    );
  }
}

export function resetEdges() {
  document.getElementById("navigation-route")?.setAttribute("d", "");
  graphData.edges.forEach((edge) => {
    const element = document.getElementById(edge.id);
    if (element) {
      element.classList.remove("path-active");
    }
  });
}

export function navigateWithDelay(
  objects: ObjectItem[],
  index: number,
  delay: number,
  navigation: Navigation,
  setNavigation: Dispatch<SetStateAction<Navigation>>
) {
  if (index < objects.length) {
    const obj = objects[index];
    navigateToObject(obj.name, navigation, setNavigation);

    setTimeout(() => {
      navigateWithDelay(objects, index + 1, delay, navigation, setNavigation);
    }, delay);
  }
}
