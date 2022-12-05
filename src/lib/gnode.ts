import { BoxCollider } from "./collider";
import { GraphEntity, type IRenderable } from "./entity";
import { InputController } from "./input";
import { Vector2 } from "./vector2d";
import { Viewport } from "./viewport";
import { GraphWorld } from "./world";

type NodeInput = {};
type NodeOutput = {};

export class GraphNode extends GraphEntity implements IRenderable {
  id: string;
  inputs: NodeInput[];
  outputs: NodeOutput[];
  connections: GraphNode[];
  collider: BoxCollider;
  width: number = 150;
  height: number = 100;
  isHoverCandidate = false;
  isHovering = false;
  isDragging = false;

  constructor(position?: Vector2) {
    super(position);
    this.id = crypto.randomUUID();
    this.collider = BoxCollider.fromNode(this);
  }

  tick() {
    const ic = InputController.getController();

    const mousePos = ic.getMousePosition();

    const isHoverCandidate = this.collider.contains(mousePos);

    this.isHoverCandidate = isHoverCandidate;

    const overlappingNodes = GraphWorld.getWorld().nodes.filter(
      (n) => n.isHoverCandidate
    );

    this.isHovering = overlappingNodes?.length
      ? overlappingNodes.findIndex((n) => n.id === this.id) ===
        overlappingNodes?.length - 1
      : this.collider.contains(mousePos);

    this.isDragging = this.isHovering && ic.isMouseDown();
    if (this.isDragging) {
      this.transform.position.x = mousePos.x - this.width / 2;
      this.transform.position.y = mousePos.y - this.height / 2;
      // Update the collider position to follow the parent node
      // TODO: Replace this with a parent transform system
      this.collider = BoxCollider.fromNode(this);
    }
  }

  private drawConnections(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.beginPath();

    const nodes = GraphWorld.getWorld().nodes;
    const nextNode = nodes[nodes.findIndex((n) => n.id === this.id) + 1];

    if (nextNode) {
      const lineOrigin = new Vector2(
        this.transform.position.x + this.width,
        this.transform.position.y + this.height / 2
      );
      const lineTerminal = new Vector2(
        nextNode.transform.position.x,
        nextNode.transform.position.y + nextNode.height / 2
      );
      const cp1 = lineOrigin.lerp(lineTerminal, 0.5);
      const clamp = 30;
      if (cp1.x <= lineOrigin.x + clamp) {
        cp1.x = lineOrigin.x + clamp;
      }
      const cp2 = lineOrigin.lerp(lineTerminal, 0.5);
      if (cp2.x >= lineTerminal.x - clamp) {
        cp2.x = lineTerminal.x - clamp;
      }
      cp1.y = lineOrigin.y;
      cp2.y = lineTerminal.y;
      ctx.moveTo(lineOrigin.x, lineOrigin.y);
      // ctx.lineTo(lineTerminal.x, lineTerminal.y);
      ctx.bezierCurveTo(
        cp1.x,
        cp1.y,
        cp2.x,
        cp2.y,
        lineTerminal.x,
        lineTerminal.y
      );
    }

    ctx.stroke();
    ctx.closePath();
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.isHovering
      ? "rgba(255, 155, 0, 0.75)"
      : "rgba(255, 255, 255, 0.75)";

    if (this.isDragging) {
      ctx.fillStyle = "green";
    }

    const camera = Viewport.getCamera();
    const ic = InputController.getController();

    ctx.fillRect(
      // Center zoom
      // (this.width - this.width * camera.zoom) / 2 + this.transform.position.x,
      // (this.height - this.height * camera.zoom) / 2 + this.transform.position.y,

      this.transform.position.x,
      this.transform.position.y,
      this.width,
      this.height
    );

    ctx.font = `${10}px monospace`;
    ctx.fillStyle = "black";

    ctx.fillText(
      `Node: ${GraphWorld.getWorld().nodes.indexOf(this).toString()}`,
      this.transform.position.x + 25,
      this.transform.position.y + 25
    );

    ctx.fillText(
      `isDragging: ${this.isDragging}`,
      this.transform.position.x + 25,
      this.transform.position.y + 50
    );

    this.drawConnections(ctx);

    // if (this.collider) {
    //   this.collider.render(ctx);
    // }
  }
}
