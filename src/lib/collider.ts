import { Vector2 } from "./vector2d";
import type { GraphNode } from "./gnode";
import type { IRenderable } from "./entity";

export class BoxCollider implements IRenderable {
  private vertices = {
    tl: Vector2.zero(),
    tr: Vector2.zero(),
    bl: Vector2.zero(),
    br: Vector2.zero(),
  };

  constructor() {}

  static fromNode(node: GraphNode) {
    const nx = node.transform.position.x;
    const ny = node.transform.position.y;
    const nw = node.width;
    const nh = node.height;

    const tl = new Vector2(nx, ny);
    const tr = new Vector2(nx + nw, ny);
    const bl = new Vector2(nx, ny + nh);
    const br = new Vector2(nx + nw, ny + nh);

    const collider = new BoxCollider();
    collider.vertices = { tl, tr, bl, br };
    return collider;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "green";
    for (const key in this.vertices) {
      const v = this.vertices[key];
      ctx.beginPath();
      ctx.arc(v.x, v.y, 5, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.closePath();
    }
  }

  static test(a: BoxCollider, b: BoxCollider) {
    return (
      a.vertices.tl.x < b.vertices.tr.x &&
      a.vertices.tr.x > b.vertices.tl.x &&
      a.vertices.tl.y < b.vertices.bl.y &&
      a.vertices.bl.y > b.vertices.bl.y
    );
  }

  contains(v: Vector2) {
    if (!v) return;
    return (
      v.x >= this.vertices["tl"]?.x &&
      v.x <= this.vertices["tr"]?.x &&
      v.y >= this.vertices["tr"]?.y &&
      v.y <= this.vertices["br"]?.y
    );
  }
}
