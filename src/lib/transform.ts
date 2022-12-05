import { Vector2 } from "./vector2d";

export class Transform {
  constructor(
    public position: Vector2,
    public scale: Vector2 // public rotation: number
  ) {}

  static default() {
    return new Transform(new Vector2(0, 0), new Vector2(1, 1));
  }
}
