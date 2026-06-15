const express = require("express");
const router = express.Router();
const routeController = require("../controllers/routeController");

// GET /api/route/vertices — list all known graph vertices
// (must be registered BEFORE the dynamic :start/:end routes would shadow it,
// though we currently use query params so order doesn't strictly matter)
router.get("/vertices", routeController.listVertices);

// GET /api/route?start=<id-or-name>&end=<id-or-name>
router.get("/", routeController.getRoute);

module.exports = router;
