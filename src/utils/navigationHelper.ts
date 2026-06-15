/**
 * Pathfinding helpers — now backed by the server-side /api/route endpoint.
 *
 * The previous version of this file ran Dijkstra in the browser using the
 * bundled graphData. The shortest-path computation has moved to the backend;
 * the frontend just renders the response.
 */
import { Dispatch, SetStateAction } from "react";
import { fetchRoute, type RouteNode, type RouteResponse } from "./routeApi";
import { Navigation, NavigationContextType } from "./types";
import { ObjectItem } from "./types";
import { graphData } from "@/store/graphData";
import { toast } from "react-toastify";

/** Module-level cache of the most recent route response. */
export let lastCalculatedRoute: RouteResponse | null = null;

/** Clear the cached route. */
export function clearCalculatedRoute() {
	lastCalculatedRoute = null;
}

/** Convenience accessor for the list of vertex ids in the cached route. */
export function lastCalculatedPath(): string[] {
	return lastCalculatedRoute ? lastCalculatedRoute.path : [];
}

export let routeLength = 0;

/**
 * Fetch a route from the backend and draw it on the current floor.
 * Returns the route response (or null on failure).
 */
export async function navigateToObject(
	selectedObjectId: string,
	navigation: NavigationContextType["navigation"],
	setNavigation: NavigationContextType["setNavigation"],
	setCurrentFloor?: Dispatch<SetStateAction<number>>,
): Promise<RouteResponse | null> {
	try {
		const route = await fetchRoute(navigation.start, selectedObjectId);
		lastCalculatedRoute = route;
		routeLength = route.distance;

		if (route.path.length === 0) {
			toast.error("No route found");
			return null;
		}

		// Switch to the floor the start vertex is on (the backend doesn't tell us
		// this directly, so we look it up in the bundled graph)
		const startVertex = graphData.vertices.find((v) => v.id === navigation.start);
		const startFloor = startVertex ? startVertex.floor : 1;
		if (setCurrentFloor) {
			setCurrentFloor(startFloor);
		}

		// Draw the path on the current floor
		drawPathForFloor(route.nodes, startFloor);

		setNavigation((prevNavigation) => ({
			...prevNavigation,
			end: selectedObjectId,
		}));

		return route;
	} catch (err: any) {
		console.error("Failed to fetch route:", err);
		toast.error(err?.message || "Failed to fetch route");
		return null;
	}
}

/**
 * Draw the route path for a specific floor using the response nodes
 * (which already contain cx/cy).
 */
export function drawPathForFloor(nodes: RouteNode[], floor: number) {
	const floorNodes = nodes.filter((n) => n.floor === floor);

	if (floorNodes.length < 2) {
		// nothing to draw on this floor, just clear it
		const navRoute = document.getElementById("navigation-route");
		if (navRoute) navRoute.setAttribute("d", "");
		return;
	}

	const firstNode = floorNodes[0];
	const pathString = floorNodes
		.slice(1)
		.map((n) => `L${n.cx} ${n.cy}`)
		.join(" ");

	const navigationRoutePath = document.getElementById("navigation-route");
	if (navigationRoutePath && firstNode) {
		navigationRoutePath.setAttribute("d", `M${firstNode.cx} ${firstNode.cy} ${pathString}`);
		navigationRoutePath.classList.remove("path-once", "path-active");
		navigationRoutePath.classList.add("path-once");
		navigationRoutePath.addEventListener(
			"animationend",
			() => {
				navigationRoutePath.classList.remove("path-once");
				navigationRoutePath.classList.add("path-active");
			},
			{ once: true },
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

/** Walk through a list of objects with a delay between each (Test mode). */
export function navigateWithDelay(
	objects: ObjectItem[],
	index: number,
	delay: number,
	navigation: Navigation,
	setNavigation: Dispatch<SetStateAction<Navigation>>,
) {
	if (index < objects.length) {
		const obj = objects[index];
		void navigateToObject(obj.name, navigation, setNavigation);

		setTimeout(() => {
			navigateWithDelay(objects, index + 1, delay, navigation, setNavigation);
		}, delay);
	}
}
