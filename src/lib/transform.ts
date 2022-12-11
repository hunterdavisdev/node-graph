import { Vector2 } from "./math/vector2d";

export class Transform {
  parent?: Transform;

  constructor(
    public position: Vector2,
    public scale: Vector2 // public rotation: number
  ) {}

  /**
   *
   * @returns a transform with a world position of 0, 0 and a scale of 1.
   */
  static default() {
    return new Transform(new Vector2(0, 0), new Vector2(1, 1));
  }
}
