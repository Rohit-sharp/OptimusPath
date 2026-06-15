/**
 * Unit tests for the route service (Dijkstra on the graph).
 * No database is touched here — we only test pathfinding logic.
 */

const { findRoute, getVertexById, findVertexByName, graphData } = require("../src/services/routeService");

describe("Graph data", () => {
	test("has 26 vertices (13 per floor + elevator each)", () => {
		expect(graphData.vertices.length).toBe(26);
	});

	test("has 25 edges (12 hallway per floor + 1 elevator)", () => {
		expect(graphData.edges.length).toBe(25);
	});

	test("contains exactly one elevator edge with type=elevator", () => {
		const elevators = graphData.edges.filter((e) => e.type === "elevator");
		expect(elevators.length).toBe(1);
		expect(elevators[0].id).toBe("elevator_f1_f2");
	});
});

describe("Vertex lookup", () => {
	test("getVertexById returns the right vertex", () => {
		const v = getVertexById("f1_v1");
		expect(v).not.toBeNull();
		expect(v.objectName).toBe("Nurse's Station");
		expect(v.floor).toBe(1);
	});

	test("getVertexById returns null for unknown id", () => {
		expect(getVertexById("nope")).toBeNull();
	});

	test("findVertexByName finds a store by name (exact)", () => {
		const v = findVertexByName("Nurse's Station");
		expect(v).not.toBeNull();
		expect(v.id).toBe("f1_v1");
	});

	test("findVertexByName is case-insensitive", () => {
		const v = findVertexByName("nurse's station");
		expect(v).not.toBeNull();
		expect(v.id).toBe("f1_v1");
	});

	test("findVertexByName returns null for unknown name", () => {
		expect(findVertexByName("Nowhere Store")).toBeNull();
	});
});

describe("Pathfinding", () => {
	test("same-floor route from f1_v1 to f1_v4 uses hallway only", () => {
		const result = findRoute("f1_v1", "f1_v4");
		expect(result.ok).toBe(true);
		// f1_v1 -> f1_v5 -> f1_v6 -> f1_v7 -> f1_v8 -> f1_v4 (5 hops)
		expect(result.route.path).toEqual(["f1_v1", "f1_v5", "f1_v6", "f1_v7", "f1_v8", "f1_v4"]);
		expect(result.route.crossesFloors).toBe(false);
		expect(result.route.floors).toEqual([1]);
		expect(result.route.distance).toBeGreaterThan(0);
	});

	test("cross-floor route from f1_v1 to f2_v4 uses the elevator", () => {
		const result = findRoute("f1_v1", "f2_v4");
		expect(result.ok).toBe(true);
		expect(result.route.crossesFloors).toBe(true);
		expect(result.route.floors).toEqual([1, 2]);
		// the path should contain both elevator vertices
		expect(result.route.path).toContain("f1_elev");
		expect(result.route.path).toContain("f2_elev");
		// directions should mention the elevator
		const hasElevatorStep = result.route.directions.some((s) => s.text.toLowerCase().includes("elevator"));
		expect(hasElevatorStep).toBe(true);
	});

	test("accepts store names as start/end", () => {
		const result = findRoute("Nurse's Station", "ICU");
		expect(result.ok).toBe(true);
		// adjacent stores on top row: f1_v1 -> f1_v5 -> f1_v6 -> f1_v2
		expect(result.route.path[0]).toBe("f1_v1");
		expect(result.route.path[result.route.path.length - 1]).toBe("f1_v2");
	});

	test("returns 400 for unknown start", () => {
		const result = findRoute("DoesNotExist", "Nurse's Station");
		expect(result.ok).toBe(false);
		expect(result.status).toBe(400);
		expect(result.error).toMatch(/Unknown start/);
	});

	test("returns 400 for unknown end", () => {
		const result = findRoute("Nurse's Station", "DoesNotExist");
		expect(result.ok).toBe(false);
		expect(result.status).toBe(400);
		expect(result.error).toMatch(/Unknown end/);
	});

	test("response includes nodes with coordinates for client rendering", () => {
		const result = findRoute("f1_v1", "f1_v2");
		expect(result.ok).toBe(true);
		expect(result.route.nodes.length).toBeGreaterThan(0);
		const first = result.route.nodes[0];
		expect(first).toHaveProperty("id");
		expect(first).toHaveProperty("floor");
		expect(first).toHaveProperty("cx");
		expect(first).toHaveProperty("cy");
	});
});
