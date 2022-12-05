import { InputController } from "./input";
import { Transform } from "./transform";
import { Viewport } from "./viewport";

export class Camera {
  public transform: Transform;
  public zoom = 1;

  public constructor() {
    this.transform = Transform.default();
  }

  tick() {
    const ic = InputController.getController();
    if (ic.isZooming()) {
      this.zoom += ic.scrollDelta * 0.0001;
      // if (this.zoom < 1) {
      //   this.zoom = 1;
      // } else if (this.zoom > 20) {
      //   this.zoom = 20;
      // } else {
      //   this.zoom = this.zoom;
      // }
    }
  }
}
