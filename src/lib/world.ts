import { Camera } from "./camera";
import { GraphNode } from "./gnode";
import type { NodeGraph } from "./graph";
import { Vector2 } from "./math/vector2d";

export class GraphWorld {
  private graph: NodeGraph;
  public nodes: GraphNode[];
  private camera: Camera;

  constructor(graph: NodeGraph) {
    this.graph = graph;
    this.nodes = [];
    this.camera = new Camera(this);
  }

  addNode(node: GraphNode) {
    this.nodes = [...this.nodes, node];
  }

  addNodeAtMousePosition() {
    const ic = this.graph.getInputController();
    const pos = this.camera.screenToWorld(ic.getMousePosition());
    this.nodes = [
      ...this.nodes,
      new GraphNode(this, new Vector2(pos.x, pos.y)),
    ];
  }

  removeNode(id: GraphNode["id"]) {
    this.nodes = this.nodes.filter((n) => n.id !== id);
  }

  /** Can be used to stress test the graph */
  seedNodes(amount: number) {
    const nodes = new Array(amount).fill(0);
    const canvas = this.graph.getViewport().getCanvas();

    for (let x = 0; x < nodes.length; x++) {
      this.addNode(
        new GraphNode(
          this,
          new Vector2(
            Math.floor(Math.random() * canvas.width),
            Math.floor(Math.random() * canvas.height)
          )
        )
      );
    }
  }

  tick() {
    this.camera.tick();
    this.nodes.forEach((n) => n.tick());
  }

  render(ctx: CanvasRenderingContext2D) {
    // this.camera.render(ctx);
    this.nodes.forEach((n) => n.render(ctx));
  }

  getGraph() {
    return this.graph;
  }

  getCamera() {
    return this.camera;
  }
}
