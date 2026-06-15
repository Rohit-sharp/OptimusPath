export interface VertexData {
  id: string;
  objectName: string | null;
  cx: number;
  cy: number;
  floor: number;
}

export interface EdgeData {
  id: string;
  from: string;
  to: string;
  type?: "walk" | "elevator";
}
export interface GraphData {
  vertices: VertexData[];
  edges: EdgeData[];
}

export const graphData: GraphData = {
  vertices: [
    // ===== Floor 1 nodes =====
    { id: "f1_v1", objectName: "Nurse's Station", cx: 180, cy: 200, floor: 1 },
    { id: "f1_v2", objectName: "ICU", cx: 410, cy: 200, floor: 1 },
    { id: "f1_v3", objectName: "Pharmacy", cx: 640, cy: 200, floor: 1 },
    { id: "f1_v4", objectName: "Operating Room", cx: 870, cy: 200, floor: 1 },
    { id: "f1_v5", objectName: null, cx: 180, cy: 400, floor: 1 },
    { id: "f1_v6", objectName: null, cx: 410, cy: 400, floor: 1 },
    { id: "f1_v7", objectName: null, cx: 640, cy: 400, floor: 1 },
    { id: "f1_v8", objectName: null, cx: 870, cy: 400, floor: 1 },
    { id: "f1_v9", objectName: "Male Ward", cx: 180, cy: 620, floor: 1 },
    { id: "f1_v10", objectName: "Female Ward", cx: 410, cy: 620, floor: 1 },
    { id: "f1_v11", objectName: "Radiology", cx: 640, cy: 620, floor: 1 },
    { id: "f1_v12", objectName: "Morgue", cx: 870, cy: 620, floor: 1 },
    { id: "f1_elev", objectName: "Elevator A (F1)", cx: 1070, cy: 400, floor: 1 },

    // ===== Floor 2 nodes =====
    { id: "f2_v1", objectName: "Outpatient Clinic", cx: 180, cy: 200, floor: 2 },
    { id: "f2_v2", objectName: "Cardiology Unit", cx: 410, cy: 200, floor: 2 },
    { id: "f2_v3", objectName: "Cafeteria", cx: 640, cy: 200, floor: 2 },
    { id: "f2_v4", objectName: "Physical Therapy", cx: 870, cy: 200, floor: 2 },
    { id: "f2_v5", objectName: null, cx: 180, cy: 400, floor: 2 },
    { id: "f2_v6", objectName: null, cx: 410, cy: 400, floor: 2 },
    { id: "f2_v7", objectName: null, cx: 640, cy: 400, floor: 2 },
    { id: "f2_v8", objectName: null, cx: 870, cy: 400, floor: 2 },
    { id: "f2_v9", objectName: "Laboratory", cx: 180, cy: 620, floor: 2 },
    { id: "f2_v10", objectName: "Administration", cx: 410, cy: 620, floor: 2 },
    { id: "f2_v11", objectName: "Chapel", cx: 640, cy: 620, floor: 2 },
    { id: "f2_v12", objectName: "Gift Shop", cx: 870, cy: 620, floor: 2 },
    { id: "f2_elev", objectName: "Elevator A (F2)", cx: 1070, cy: 400, floor: 2 },
  ],

  edges: [
    // Floor 1 hallway connections (top row to hallway)
    { id: "f1_v1_to_f1_v5", from: "f1_v1", to: "f1_v5" },
    { id: "f1_v2_to_f1_v6", from: "f1_v2", to: "f1_v6" },
    { id: "f1_v3_to_f1_v7", from: "f1_v3", to: "f1_v7" },
    { id: "f1_v4_to_f1_v8", from: "f1_v4", to: "f1_v8" },
    // Floor 1 hallway horizontal
    { id: "f1_v5_to_f1_v6", from: "f1_v5", to: "f1_v6" },
    { id: "f1_v6_to_f1_v7", from: "f1_v6", to: "f1_v7" },
    { id: "f1_v7_to_f1_v8", from: "f1_v7", to: "f1_v8" },
    // Floor 1 hallway to bottom row
    { id: "f1_v5_to_f1_v9", from: "f1_v5", to: "f1_v9" },
    { id: "f1_v6_to_f1_v10", from: "f1_v6", to: "f1_v10" },
    { id: "f1_v7_to_f1_v11", from: "f1_v7", to: "f1_v11" },
    { id: "f1_v8_to_f1_v12", from: "f1_v8", to: "f1_v12" },
    // Floor 1 elevator connection
    { id: "f1_v8_to_f1_elev", from: "f1_v8", to: "f1_elev" },

    // Floor 2 hallway connections (top row to hallway)
    { id: "f2_v1_to_f2_v5", from: "f2_v1", to: "f2_v5" },
    { id: "f2_v2_to_f2_v6", from: "f2_v2", to: "f2_v6" },
    { id: "f2_v3_to_f2_v7", from: "f2_v3", to: "f2_v7" },
    { id: "f2_v4_to_f2_v8", from: "f2_v4", to: "f2_v8" },
    // Floor 2 hallway horizontal
    { id: "f2_v5_to_f2_v6", from: "f2_v5", to: "f2_v6" },
    { id: "f2_v6_to_f2_v7", from: "f2_v6", to: "f2_v7" },
    { id: "f2_v7_to_f2_v8", from: "f2_v7", to: "f2_v8" },
    // Floor 2 hallway to bottom row
    { id: "f2_v5_to_f2_v9", from: "f2_v5", to: "f2_v9" },
    { id: "f2_v6_to_f2_v10", from: "f2_v6", to: "f2_v10" },
    { id: "f2_v7_to_f2_v11", from: "f2_v7", to: "f2_v11" },
    { id: "f2_v8_to_f2_v12", from: "f2_v8", to: "f2_v12" },
    // Floor 2 elevator connection
    { id: "f2_v8_to_f2_elev", from: "f2_v8", to: "f2_elev" },

    // Elevator between floors
    { id: "elevator_f1_f2", from: "f1_elev", to: "f2_elev", type: "elevator" },
  ],
};

// helper to get vertices for a specific floor
export function getVerticesForFloor(floor: number) {
  return graphData.vertices.filter((v) => v.floor === floor);
}

// get edges that are relevant to a floor (both endpoints on same floor)
export function getEdgesForFloor(floor: number) {
  return graphData.edges.filter((edge) => {
    const fromV = graphData.vertices.find((v) => v.id === edge.from);
    const toV = graphData.vertices.find((v) => v.id === edge.to);
    return fromV && toV && fromV.floor === floor && toV.floor === floor;
  });
}
