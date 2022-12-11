import { Camera } from "./camera";
import { GraphNode } from "./gnode";
import type { NodeGraph } from "./graph";
import { InputController } from "./input";
import { Vector2 } from "./math/vector2d";

export class GraphWorld {
  private graph: NodeGraph;

  constructor(graph: NodeGraph, public nodes: GraphNode[] = []) {
    this.graph = graph;
  }

  addNode(node: GraphNode) {
    this.nodes = [...this.nodes, node];
  }

  addNodeAtMousePosition() {
    const ic = this.graph.getInputController();
    const pos = ic.getMousePosition();
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
    this.nodes.forEach((n) => n.tick());
  }

  render(ctx: CanvasRenderingContext2D) {
    this.nodes.forEach((n) => n.render(ctx));
  }

  getGraph() {
    return this.graph;
  }
}
