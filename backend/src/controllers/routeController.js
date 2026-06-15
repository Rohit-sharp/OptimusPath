const routeService = require("../services/routeService");

/**
 * Controller for indoor routing endpoints.
 *
 * GET /api/route?start=<id-or-store-name>&end=<id-or-store-name>
 *
 * `start` and `end` can be either a vertex id (e.g. "f1_v5") or a
 * store name (e.g. "Coffee Bean"). Names are matched case-insensitively.
 */

// GET /api/route
function getRoute(req, res) {
	try {
		const { start, end } = req.query;

		if (!start || !end) {
			return res.status(400).json({ error: "Missing required query params: start and end" });
		}

		const result = routeService.findRoute(String(start), String(end));

		if (!result.ok) {
			return res.status(result.status).json({ error: result.error });
		}

		res.json(result.route);
	} catch (err) {
		console.error("Error computing route:", err);
		res.status(500).json({ error: "Failed to compute route" });
	}
}

// GET /api/route/vertices — list all known vertices (useful for clients
// building UIs without bundling the graph)
function listVertices(req, res) {
	try {
		const vertices = routeService.graphData.vertices.map((v) => ({
			id: v.id,
			objectName: v.objectName,
			floor: v.floor,
			cx: v.cx,
			cy: v.cy,
		}));
		res.json({ vertices });
	} catch (err) {
		console.error("Error listing vertices:", err);
		res.status(500).json({ error: "Failed to list vertices" });
	}
}

module.exports = { getRoute, listVertices };
