import BezierCurveScene from "./BezierCurve.svelte";
import NodeGraphSvelte from "./NodeGraph.svelte";
import "./assets/global.css";

// const app = new BezierCurveScene({
//   target: document.getElementById("app"),
// });

const app = new NodeGraphSvelte({
  target: document.getElementById("app"),
});

export default app;
