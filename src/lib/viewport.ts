import { Camera } from "./camera";
import type { NodeGraph } from "./graph";
import { drawCircle, drawDebugText } from "./helpers";

export class Viewport {
  private graph: NodeGraph;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(graph: NodeGraph, canvas: HTMLCanvasElement) {
    this.graph = graph;
    this.canvas = canvas;
    this.ctx = this.getContext();
    // this.ctx.scale(0.5, 0.5);
  }
  getCanvas() {
    return this.canvas;
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

  drawGrid() {
    const camera = this.graph.getWorld().getCamera();
    const ctx = this.getContext();
    const gridGap = 40;
    const columns = this.canvas.width / gridGap;
    const rows = this.canvas.height / gridGap;

    ctx.fillStyle = "#222222";
    for (let r = 1; r < rows; r++) {
      for (let c = 1; c < columns; c++) {
        // ctx.beginPath();
        // ctx.arc(c * gridGap, r * gridGap, 2, 0, Math.PI * 180, false);
        // ctx.fill();
        // ctx.closePath();
        drawCircle(ctx, {
          x: c * gridGap,
          y: r * gridGap,
          radius: 2,
          fillColor: "#222222",
        });
      }
    }
  }

  updateCursor() {
    const worldNodes = this.graph.getWorld().nodes;
    this.canvas.style.cursor = worldNodes.some((n) => n.isHovering)
      ? "grab"
      : "default";
  }

  render() {
    const worldNodes = this.graph.getWorld().nodes;
    const ic = this.graph.getInputController();

    this.clear("#111111");
    this.drawGrid();
    this.updateCursor();

    this.graph.getWorld().render(this.ctx);

    // if (ic.isPanning()) {
    //   const start = ic.getStartPanPosition();
    //   const end = ic.getMousePosition();

    //   this.ctx.strokeStyle = "white";
    //   this.ctx.beginPath();
    //   this.ctx.moveTo(start.x, start.y);
    //   this.ctx.lineTo(end.x, end.y);
    //   this.ctx.stroke();
    //   this.ctx.closePath();
    // }

    const debugStrings = [
      `Mouse Position: ${ic.getMousePosition()?.toString()}`,
      `Mouse Down: ${ic.isMouseDown()}`,
      `Mouse Delta: ${ic.getMouseDelta()?.toString()}`,
      `Zooming?: ${ic.isZooming()} ${(ic.scrollDelta * 0.01).toFixed(2)}`,
      `FPS: ${this.graph.getChrono().getFPS().toFixed(4)}`,
    ];

    drawDebugText(this.ctx, debugStrings.join("\n"), {
      x: 0,
      y: 0,
      padding: 10,
      lineHeight: 18,
      fillColor: "white",
      font: "18px monospace",
    });
  }
}
