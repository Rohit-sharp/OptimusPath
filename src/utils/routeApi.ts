/**
 * API client for the pathfinding backend.
 * All requests go through the Vite proxy → localhost:3001.
 */

const API_BASE = "/api";

export interface RouteNode {
	id: string;
	objectName: string | null;
	floor: number;
	cx: number;
	cy: number;
}

export interface RouteDirection {
	text: string;
	floor: number;
}

export interface RouteResponse {
	start: { id: string; objectName: string | null; floor: number };
	end: { id: string; objectName: string | null; floor: number };
	path: string[];
	nodes: RouteNode[];
	distance: number;
	crossesFloors: boolean;
	floors: number[];
	directions: RouteDirection[];
}

/**
 * Fetches the shortest path between two vertices.
 * `start` and `end` can be either vertex ids (e.g. "f1_v5") or store
 * names (e.g. "Coffee Bean"); the backend resolves names case-insensitively.
 */
export async function fetchRoute(start: string, end: string): Promise<RouteResponse> {
	const url = `${API_BASE}/route?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
	const res = await fetch(url);
	if (!res.ok) {
		const data = await res.json().catch(() => ({}));
		throw new Error((data && data.error) || "Failed to fetch route");
	}
	return res.json();
}
