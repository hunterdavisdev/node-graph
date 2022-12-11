import { Transform } from "./transform";
import type { Vector2 } from "./math/vector2d";
import type { NodeGraph } from "./graph";

export interface IRenderable {
  render: (ctx: CanvasRenderingContext2D) => any;
}

export class GraphEntity {
  public transform: Transform;

  constructor(position?: Vector2) {
    // Initialize a new transform at position 0, 0 with no rotation or additional scaling.
    this.transform = Transform.default();

    if (position) {
      this.transform.position = position;
    }
  }
}
