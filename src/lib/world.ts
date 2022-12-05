import { Camera } from "./camera";
import type { GraphNode } from "./gnode";

export class GraphWorld {
  static world: GraphWorld;

  private constructor(
    public nodes: GraphNode[] = [],
    public camera: Camera = new Camera()
  ) {}

  static getWorld() {
    if (!this.world) {
      this.world = new GraphWorld();
    }
    return this.world;
  }

  addNode(node: GraphNode) {
    this.nodes = [...this.nodes, node];
  }

  removeNode(id: GraphNode["id"]) {
    this.nodes = this.nodes.filter((n) => n.id !== id);
  }
}
