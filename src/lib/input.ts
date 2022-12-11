import { Vector2 } from "./vector2d";
import type { GraphConfig } from "./viewport";

export class InputController {
  private canvas: HTMLCanvasElement;
  private mousePosition: Vector2;
  private _isMouseDown: boolean;
  private _isZooming: boolean;
  private isShortcutting: boolean;
  public scrollDelta: number;

  static _inputController: InputController;

  static getController() {
    if (!this._inputController) {
      this._inputController = new InputController();
    }
    return this._inputController;
  }

  setCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  initializeListeners(config?: GraphConfig) {
    if (config?.onContextMenuRequested) {
      this.canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        config?.onContextMenuRequested(e);
      });
    }

    this.canvas.addEventListener("mousemove", (e) => {
      this.setMousePosition(e, this.canvas);
    });

    this.canvas.addEventListener("mousedown", () => {
      this.setIsMouseDown(true);
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

  constructor() {}

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
