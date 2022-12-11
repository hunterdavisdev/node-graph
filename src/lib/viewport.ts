import { GraphNode } from "./gnode";
import { Vector2 } from "./vector2d";
import { GraphWorld } from "./world";
import { Camera } from "./camera";
import { InputController } from "./input";

export type GraphConfig = {
  onContextMenuRequested: (e: MouseEvent) => void;
};

export class Viewport {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fps = 0;
  private deltaTime = 0.0;

  private previousTime: DOMHighResTimeStamp;

  private static _camera: Camera;

  static getCamera() {
    if (!this._camera) {
      this._camera = new Camera();
    }
    return this._camera;
  }

  constructor(canvas: HTMLCanvasElement, config?: GraphConfig) {
    this.canvas = canvas;
    this.ctx = this.getContext();

    const ic = InputController.getController();
    ic.setCanvas(canvas);
    ic.initializeListeners(config);

    // TODO: This should do in the input controller eventually
    this.canvas.addEventListener("mouseup", () => {
      ic.setIsMouseDown(false);

      // if (
      //   !GraphWorld.getWorld().nodes.some((n) => n.isHovering || n.isDragging)
      // ) {
      //   const node = new GraphNode(
      //     new Vector2(
      //       ic.getMousePosition().x - GraphNode.defaultWidth / 2,
      //       ic.getMousePosition().y - GraphNode.defaultHeight / 2
      //     )
      //   );

      //   GraphWorld.getWorld().addNode(node);
      // }
    });

    // !!! Uncomment to stress test 1200 nodes at once :)
    const nodes = new Array(300).fill(0);
    const world = GraphWorld.getWorld();

    for (let x = 0; x < nodes.length; x++) {
      world.addNode(
        new GraphNode(
          new Vector2(
            Math.floor(Math.random() * canvas.width),
            Math.floor(Math.random() * canvas.height)
          )
        )
      );
    }
  }

  getContext() {
    if (!this.ctx) this.ctx = this.canvas.getContext("2d");
    return this.ctx;
  }

  clear(clearColor?: string) {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    if (!clearColor) this.ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = clearColor;
    ctx.fillRect(0, 0, width, height);
  }

  private calculateFrameDelta(time?: DOMHighResTimeStamp) {
    if (!this.previousTime) {
      this.previousTime = time;
      this.fps = 0;
      return 0;
    }

    const delta = (time - this.previousTime) / 1000;
    this.previousTime = time;
    this.fps = 1 / delta;
    return delta;
  }

  drawGrid() {
    const ctx = this.getContext();
    const gridGap = 30;
    const columns = this.canvas.width / gridGap;
    const rows = this.canvas.height / gridGap;

    ctx.fillStyle = "#222222";
    for (let r = 1; r < rows; r++) {
      for (let c = 1; c < columns; c++) {
        ctx.beginPath();
        ctx.arc(c * gridGap, r * gridGap, 2, 0, Math.PI * 180, false);
        ctx.fill();
        ctx.closePath();
        // ctx.fillRect(c * gridGap, r * gridGap, 5, 5);
      }
    }

    // ctx.beginPath();
    // ctx.strokeStyle = "#222222";

    // for (let x = 0; x < columns; x++) {
    //   ctx.moveTo(this.canvas.width - x * gridGap, 0);
    //   ctx.lineTo(this.canvas.width - x * gridGap, this.canvas.height);
    // }

    // for (let x = 0; x < rows; x++) {
    //   ctx.moveTo(0, x * gridGap);
    //   ctx.lineTo(this.canvas.width, x * gridGap);
    // }

    // ctx.moveTo(4, 0);
    // ctx.lineTo(4, this.canvas.height);
    // ctx.fillRect(0, 0, 10, 10);

    // ctx.stroke();
    // ctx.closePath();
  }

  render(time?: DOMHighResTimeStamp) {
    const zoom = Viewport.getCamera().zoom;

    this.ctx.scale(zoom, zoom);

    const ic = InputController.getController();

    if (!time) {
      window.requestAnimationFrame(this.render.bind(this));
      return;
    }

    let world = GraphWorld.getWorld();

    const dt = this.calculateFrameDelta(time);
    this.deltaTime += dt;

    this.clear("#111111");
    this.drawGrid();

    const nodes = GraphWorld.getWorld().nodes;

    this.canvas.style.cursor = nodes.some((n) => n.isHovering)
      ? "grab"
      : "default";

    GraphWorld.getWorld().nodes.forEach((node) => {
      Viewport.getCamera().tick();
      node.tick();
      node.render(this.ctx);
    });

    this.ctx.resetTransform();

    this.ctx.fillStyle = "#111111";
    this.ctx.fillRect(this.canvas.width - 400, 0, 400, 100);

    this.ctx.fillStyle = "green";
    this.ctx.font = "16px monospace";
    let text = `FPS: ${this.fps.toFixed(4)}`;
    let textWidth = this.ctx.measureText(text)?.width + 20;
    this.ctx.fillText(text, this.canvas.width - textWidth, 30);

    text = `Mouse Position: ${ic.getMousePosition()?.toString()}`;
    textWidth = this.ctx.measureText(text)?.width + 20;
    this.ctx.fillText(text, this.canvas.width - textWidth, 60);

    text = `zooming?: ${ic.isZooming()} ${(ic.scrollDelta * 0.01).toFixed(2)}`;
    textWidth = this.ctx.measureText(text)?.width + 20;
    this.ctx.fillText(text, this.canvas.width - textWidth, 90);

    window.requestAnimationFrame(this.render.bind(this));
  }
}
