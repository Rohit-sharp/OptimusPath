/**
 * Route service — server-side Dijkstra pathfinding.
 *
 * This is a JavaScript port of the frontend's `src/algorithms/dijkstra.ts`,
 * adapted to a CommonJS module so it can run inside Express.
 *
 * - Edge weights are Euclidean distance between vertices,
 *   EXCEPT the elevator edge which uses a fixed ELEVATOR_WEIGHT.
 * - The graph is built once at module load (singleton).
 */

const { graphData, ELEVATOR_WEIGHT } = require("../data/graph");

// --- Min-heap priority queue (matches the TS version) ---
class PriorityQueue {
	constructor() {
		this.values = [];
	}

	enqueue(id, priority) {
		this.values.push({ id, priority });
		this.bubbleUp();
	}

	bubbleUp() {
		let idx = this.values.length - 1;
		const element = this.values[idx];
		while (idx > 0) {
			const parentIdx = Math.floor((idx - 1) / 2);
			const parent = this.values[parentIdx];
			if (element.priority >= parent.priority) break;
			this.values[parentIdx] = element;
			this.values[idx] = parent;
			idx = parentIdx;
		}
	}

	dequeue() {
		const min = this.values[0];
		const end = this.values.pop();
		if (this.values.length > 0 && end) {
			this.values[0] = end;
			this.sinkDown();
		}
		return min;
	}

	sinkDown() {
		let idx = 0;
		const length = this.values.length;
		const element = this.values[0];
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const leftChildIdx = 2 * idx + 1;
			const rightChildIdx = 2 * idx + 2;
			let leftChild, rightChild;
			let swap = null;

			if (leftChildIdx < length) {
				leftChild = this.values[leftChildIdx];
				if (leftChild.priority < element.priority) {
					swap = leftChildIdx;
				}
			}
			if (rightChildIdx < length) {
				rightChild = this.values[rightChildIdx];
				if ((swap === null && rightChild.priority < element.priority) || (swap !== null && leftChild && rightChild.priority < leftChild.priority)) {
					swap = rightChildIdx;
				}
			}
			if (swap === null) break;
			this.values[idx] = this.values[swap];
			this.values[swap] = element;
			idx = swap;
		}
	}
}

// --- Dijkstra graph wrapper ---
class DijkstraCalculator {
	constructor() {
		this.adjacencyList = {};
	}

	addVertex(vertex) {
		if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
	}

	addEdge(v1, v2, weight = 1) {
		this.adjacencyList[v1].push({ id: v2, weight });
		this.adjacencyList[v2].push({ id: v1, weight });
	}

	calculateShortestPath(start, finish) {
		const nodes = new PriorityQueue();
		const distances = {};
		const previous = {};
		const path = [];
		let smallest = null;

		// initial state
		for (const vertex in this.adjacencyList) {
			if (vertex === start) {
				distances[vertex] = 0;
				nodes.enqueue(vertex, 0);
			} else {
				distances[vertex] = Infinity;
				nodes.enqueue(vertex, Infinity);
			}
			delete previous[vertex];
		}

		while (nodes.values.length) {
			smallest = nodes.dequeue().id;
			if (smallest === finish) {
				while (smallest && previous[smallest]) {
					path.push(smallest);
					smallest = previous[smallest];
				}
				break;
			}
			if (smallest || distances[smallest] !== Infinity) {
				for (const neighbor in this.adjacencyList[smallest]) {
					const nextNode = this.adjacencyList[smallest][neighbor];
					const candidate = distances[smallest] + nextNode.weight;
					const nextNeighbor = nextNode.id;
					if (candidate < distances[nextNeighbor]) {
						distances[nextNeighbor] = candidate;
						previous[nextNeighbor] = smallest;
						nodes.enqueue(nextNeighbor, candidate);
					}
				}
			}
		}

		let finalPath = [];
		if (!smallest) {
			finalPath = path.reverse();
		} else {
			finalPath = path.concat(smallest).reverse();
		}

		if (finalPath.length <= 1) {
			return [];
		}
		return finalPath;
	}
}

// Build the graph once at module load
const graph = new DijkstraCalculator();
graphData.vertices.forEach((vertex) => graph.addVertex(vertex.id));

function calculateDistance(v1, v2) {
	const dx = v2.cx - v1.cx;
	const dy = v2.cy - v1.cy;
	return Math.sqrt(dx * dx + dy * dy);
}

graphData.edges.forEach((edge) => {
	const fromV = graphData.vertices.find((v) => v.id === edge.from);
	const toV = graphData.vertices.find((v) => v.id === edge.to);
	if (fromV && toV) {
		if (edge.type === "elevator") {
			graph.addEdge(edge.from, edge.to, ELEVATOR_WEIGHT);
		} else {
			graph.addEdge(edge.from, edge.to, calculateDistance(fromV, toV));
		}
	}
});

// --- Public helpers ---

// Resolve a vertex id by its `objectName` (store name), e.g. "Coffee Bean" -> "f1_v1"
function findVertexByName(name) {
	if (!name) return null;
	// exact match first
	let v = graphData.vertices.find((vertex) => vertex.objectName === name);
	if (v) return v;
	// case-insensitive fallback
	const lower = name.toLowerCase();
	v = graphData.vertices.find((vertex) => (vertex.objectName || "").toLowerCase() === lower);
	return v || null;
}

function getVertexById(id) {
	return graphData.vertices.find((v) => v.id === id) || null;
}

// Compute total Euclidean distance along a path (matches the per-edge weights)
function pathDistance(path) {
	let total = 0;
	for (let i = 0; i < path.length - 1; i++) {
		const a = getVertexById(path[i]);
		const b = getVertexById(path[i + 1]);
		if (a && b) total += calculateDistance(a, b);
	}
	return Math.round(total * 100) / 100;
}

function pathCrossesFloors(path) {
	const floors = new Set();
	for (const id of path) {
		const v = getVertexById(id);
		if (v) floors.add(v.floor);
	}
	return floors.size > 1;
}

function getFloorsInPath(path) {
	const floors = new Set();
	for (const id of path) {
		const v = getVertexById(id);
		if (v) floors.add(v.floor);
	}
	return Array.from(floors).sort();
}

// Build human-readable direction steps (mirrors the TS getDirectionSteps)
function getDirectionSteps(path) {
	const steps = [];
	for (let i = 0; i < path.length; i++) {
		const current = getVertexById(path[i]);
		const next = i < path.length - 1 ? getVertexById(path[i + 1]) : null;
		if (!current) continue;

		if (i === 0) {
			const name = current.objectName || current.id;
			steps.push({ text: `Start at ${name}`, floor: current.floor });
		}

		if (next && current.floor !== next.floor) {
			steps.push({
				text: `Take Elevator A to Floor ${next.floor}`,
				floor: current.floor,
			});
		}

		if (i === path.length - 1) {
			const name = current.objectName || current.id;
			steps.push({ text: `Arrive at ${name}`, floor: current.floor });
		}
	}
	return steps;
}

// Main entry point for the API
// Resolves start/end (accepting either a vertex id or a store name),
// runs Dijkstra, and returns a structured response.
function findRoute(startInput, endInput) {
	let startVertex = getVertexById(startInput);
	if (!startVertex) startVertex = findVertexByName(startInput);

	let endVertex = getVertexById(endInput);
	if (!endVertex) endVertex = findVertexByName(endInput);

	if (!startVertex) {
		return { ok: false, status: 400, error: `Unknown start: "${startInput}"` };
	}
	if (!endVertex) {
		return { ok: false, status: 400, error: `Unknown end: "${endInput}"` };
	}

	const path = graph.calculateShortestPath(startVertex.id, endVertex.id);
	if (path.length === 0) {
		return { ok: false, status: 404, error: "No route found" };
	}

	const nodes = path.map((id) => {
		const v = getVertexById(id);
		return { id: v.id, objectName: v.objectName, floor: v.floor, cx: v.cx, cy: v.cy };
	});

	return {
		ok: true,
		status: 200,
		route: {
			start: { id: startVertex.id, objectName: startVertex.objectName, floor: startVertex.floor },
			end: { id: endVertex.id, objectName: endVertex.objectName, floor: endVertex.floor },
			path,
			nodes,
			distance: pathDistance(path),
			crossesFloors: pathCrossesFloors(path),
			floors: getFloorsInPath(path),
			directions: getDirectionSteps(path),
		},
	};
}

module.exports = {
	findRoute,
	getVertexById,
	findVertexByName,
	graphData,
};
