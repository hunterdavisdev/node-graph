import { Vector2 } from "./math/vector2d";
import type { GraphConfig, NodeGraph } from "./graph";

export class InputController {
  private mousePosition: Vector2;
  private _isMouseDown: boolean;
  private _isZooming: boolean;
  private isShortcutting: boolean;
  public scrollDelta: number;
  static _inputController: InputController;

  // Camera panning stuff
  private isPanningInputDown = false;
  private lastFrameMousePosition: Vector2;
  private mouseDelta: number;
  private mouseVelocity: number;

  constructor(private graph: NodeGraph) {}

  initializeListeners() {
    const canvas = this.graph.getViewport().getCanvas();
    const config = this.graph.getConfig();

    if (config?.onContextMenuRequested) {
      canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        config?.onContextMenuRequested(e);
      });
    }

    canvas.addEventListener("mousemove", (e) => {
      this.setMousePosition(e, canvas);
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 1) {
        this.isPanningInputDown = true;
      }
      this.setIsMouseDown(true);
    });

    canvas.addEventListener("mouseup", (e) => {
      this.setIsMouseDown(false);
    });

    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "MetaLeft":
          this.isShortcutting = true;
        default:
      }
    });

    document.addEventListener("keyup", (e) => {
      this.isShortcutting = false;
      this._isZooming = false;
    });

    document.addEventListener(
      "wheel",
      (e) => {
        if (this.isShortcutting) {
          e.preventDefault();
        }
        this.scrollDelta = e.deltaY;
        this._isZooming = this.isShortcutting;
      },
      { passive: false }
    );
  }

  tick() {
    if (!this.lastFrameMousePosition) {
      this.lastFrameMousePosition = this.getMousePosition();
    }

    const mousePosition = this.getMousePosition();

    if (mousePosition) {
      this.mouseDelta = this.getMousePosition().distanceTo(
        this.lastFrameMousePosition
      );

      this.lastFrameMousePosition = mousePosition;
    }
  }

  setMousePosition(event: MouseEvent, canvas: HTMLCanvasElement) {
    const canvasBounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasBounds.width;
    const scaleY = canvas.height / canvasBounds.height;

    this.mousePosition = new Vector2(
      (event.clientX - canvasBounds.left) * scaleX,
      (event.clientY - canvasBounds.top) * scaleY
    );
  }

  getMousePosition() {
    return this.mousePosition;
  }

  getMouseDelta() {
    return this.mouseDelta;
  }

  setIsMouseDown(flag: boolean) {
    this._isMouseDown = flag;
  }

  isMouseDown() {
    return this._isMouseDown;
  }

  isZooming() {
    return this._isZooming;
  }
}
