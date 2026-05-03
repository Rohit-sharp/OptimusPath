# PathPal - Indoor Wayfinding (Multi-Floor Extension)

## What I Added

I extended the existing indoor wayfinding app to support **multi-floor navigation**. Here's what's new:

- **Floor Selector** — simple tab buttons (1 / 2) in the toolbar to switch between floors
- **Two floor maps** — created `floor-1.svg` and `floor-2.svg` with different shops on each floor
- **Extended navigation graph** — each floor has its own set of nodes and edges, connected by an elevator edge
- **Cross-floor Dijkstra routing** — the algorithm now works across floors. Elevator edges have a fixed weight so the pathfinder can route through them when needed
- **Direction steps** — when a route goes through the elevator, a "Directions" panel shows up with steps like "Take Elevator A to Floor 2". You can click the elevator step to switch the map view to that floor
- **Route visualization per floor** — the path is drawn only for the floor you're currently viewing. Switch floors to see the rest of the route

## How to Run

```bash
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

**To test cross-floor routing:** search for a shop on Floor 2 (like "Cinema Hall") while your position is on Floor 1. You should see the directions panel and the route going to the elevator.

## Challenges

1. **Drawing the path per-floor** was a bit tricky. The original code drew the entire route as one SVG path, but with multi-floor you only want to show the segment for the current floor. I ended up filtering the path nodes by floor before drawing, and added a small timeout when switching floors so the SVG has time to re-render before we draw on it (felt hacky but it works).

2. **Elevator weight tuning** — I wasn't sure what cost to give the elevator edge. Too low and the algorithm would route through it unnecessarily, too high and it would never use it. Settled on a fixed weight of 50 which seems to work fine for the map scale I'm using.
