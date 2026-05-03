import { graphData, VertexData } from "@/store/graphData";

type NodeId = string;
interface Node {
  id: NodeId;
  priority: number;
}
class PriorityQueue {
  values: Node[];

  constructor() {
    this.values = [];
  }

  enqueue(id: NodeId, priority: number) {
    const newNode: Node = { id, priority };
    this.values.push(newNode);
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
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null &&
            leftChild &&
            rightChild.priority < leftChild.priority)
        ) {
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

class DijkstraCalculator {
  adjacencyList: { [key: NodeId]: { id: NodeId; weight: number }[] };

  constructor() {
    this.adjacencyList = {};
  }

  addVertex(vertex: NodeId) {
    if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
  }

  addEdge(vertex1: NodeId, vertex2: NodeId, weight = 1) {
    this.adjacencyList[vertex1].push({ id: vertex2, weight });
    this.adjacencyList[vertex2].push({ id: vertex1, weight });
  }

  calculateShortestPath(start: NodeId, finish: NodeId) {
    const nodes = new PriorityQueue();
    const distances: { [key: NodeId]: number } = {};
    const previous: { [key: NodeId]: NodeId } = {};
    const path = [];
    let smallest: string | null = null;
    //build up initial state
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
    // as long as there is something to visit
    while (nodes.values.length) {
      smallest = nodes.dequeue().id;
      if (smallest === finish) {
        //BUILD UP PATH TO RETURN AT END
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

    let finalPath: string[] = [];
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

export const graph = new DijkstraCalculator();

graphData.vertices.forEach((vertex) => {
  graph.addVertex(vertex.id);
});

graphData.edges.forEach((edge) => {
  const { from, to, type } = edge;
  const fromVertex = graphData.vertices.find((vertex) => vertex.id === from);
  const toVertex = graphData.vertices.find((vertex) => vertex.id === to);

  if (fromVertex && toVertex) {
    if (type === "elevator") {
      // elevator edges get a fixed cost - kinda like a penalty for taking elevator
      // but not too high so the algorithm still uses it when needed
      graph.addEdge(from, to, 50);
    } else {
      const length = calculateDistance(fromVertex, toVertex);
      graph.addEdge(from, to, length);
    }
  }
});

function calculateDistance(vertex1: VertexData, vertex2: VertexData) {
  const dx = vertex2.cx - vertex1.cx;
  const dy = vertex2.cy - vertex1.cy;
  return Math.sqrt(dx * dx + dy * dy);
}

// figure out which floors the route goes through
export function getRouteFloors(path: string[]): number[] {
  const floors: number[] = [];
  for (const nodeId of path) {
    const vertex = graphData.vertices.find((v) => v.id === nodeId);
    if (vertex && !floors.includes(vertex.floor)) {
      floors.push(vertex.floor);
    }
  }
  return floors;
}

// check if route crosses floors
export function routeCrossesFloors(path: string[]): boolean {
  const floors = getRouteFloors(path);
  return floors.length > 1;
}

// get direction steps for the route
export function getDirectionSteps(path: string[]) {
  const steps: { text: string; floor: number }[] = [];
  
  for (let i = 0; i < path.length; i++) {
    const currentVertex = graphData.vertices.find((v) => v.id === path[i]);
    const nextVertex = i < path.length - 1 
      ? graphData.vertices.find((v) => v.id === path[i + 1]) 
      : null;

    if (!currentVertex) continue;

    // check if this is the start
    if (i === 0) {
      const name = currentVertex.objectName || currentVertex.id;
      steps.push({ text: `Start at ${name}`, floor: currentVertex.floor });
    }

    // check if we're crossing floors (elevator transition)
    if (nextVertex && currentVertex.floor !== nextVertex.floor) {
      steps.push({
        text: `Take Elevator A to Floor ${nextVertex.floor}`,
        floor: currentVertex.floor,
      });
    }

    // last node = destination
    if (i === path.length - 1) {
      const name = currentVertex.objectName || currentVertex.id;
      steps.push({ text: `Arrive at ${name}`, floor: currentVertex.floor });
    }
  }

  return steps;
}
