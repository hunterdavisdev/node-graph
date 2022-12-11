import { GraphEntity, type IRenderable } from "./entity";
import type { GraphNode } from "./gnode";
import { drawRect } from "./helpers";
import { Vector2 } from "./math/vector2d";
import { Transform } from "./transform";
import type { GraphWorld } from "./world";

export class Camera extends GraphEntity implements IRenderable {
  public zoom = 1;

  // The viewing frustum of the camera. Anything outside of this volume will be occluded during rendering
  private frustum = {
    width: 800,
    height: 800,
  };

  public constructor(private world: GraphWorld) {
    super();
    this.transform = Transform.default();
    const canvas = this.world.getGraph().getViewport().getCanvas();

    this.transform.position.x = canvas.width / 2;
    this.transform.position.y = canvas.height / 2;

    this.frustum.width = canvas.width;
    this.frustum.height = canvas.height;
  }

  tick() {
    const IC = this.world.getGraph().getInputController();

    if (IC.isPanning()) {
      const mouseDelta = IC.getMouseDelta();
      this.transform.position.x -= mouseDelta.x;
      this.transform.position.y -= mouseDelta.y;
    }

    if (IC.scrollDelta) {
      this.zoom += IC.scrollDelta * 0.001;
      IC.scrollDelta = 0;
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    drawRect(ctx, {
      x: this.transform.position.x,
      y: this.transform.position.y,
      width: 5,
      height: 5,
      fillColor: "red",
    });

    drawRect(ctx, {
      x: this.transform.position.x - this.frustum.width / 2,
      y: this.transform.position.y - this.frustum.height / 2,
      width: this.frustum.width,
      height: this.frustum.height,
      strokeColor: "blue",
    });
  }

  worldToScreen(position: Vector2) {
    return new Vector2(
      (position.x - this.transform.position.x) * this.zoom,
      (position.y - this.transform.position.y) * this.zoom
    );
  }

  screenToWorld(position: Vector2) {
    return new Vector2(
      (position.x + this.transform.position.x) * this.zoom,
      (position.y + this.transform.position.y) * this.zoom
    );
  }
}
