import { xlink_attr } from "svelte/internal";
import { GraphEntity, type IRenderable } from "./entity";
import { drawRect } from "./helpers";
import { InputController } from "./input";
import { Transform } from "./transform";
import { Viewport } from "./viewport";

export class Camera extends GraphEntity implements IRenderable {
  public zoom = 1;

  public constructor() {
    super();
    this.transform = Transform.default();
  }

  tick() {}

  render(ctx: CanvasRenderingContext2D) {
    drawRect(ctx, {
      width: 5,
      height: 5,
      x: this.transform.position.x,
      y: this.transform.position.y,
      fillColor: "red",
    });
  }
}
