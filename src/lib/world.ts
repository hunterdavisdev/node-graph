import { Camera } from "./camera";
import { GraphNode } from "./gnode";
import { InputController } from "./input";
import { Vector2 } from "./vector2d";

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

  addNodeAtMousePosition() {
    const ic = InputController.getController();
    const pos = ic.getMousePosition();
    this.nodes = [...this.nodes, new GraphNode(new Vector2(pos.x, pos.y))];
  }

  removeNode(id: GraphNode["id"]) {
    this.nodes = this.nodes.filter((n) => n.id !== id);
  }
}
