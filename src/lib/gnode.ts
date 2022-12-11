import { GraphEntity, type IRenderable } from "./entity";
import { drawCircle, drawRect, drawText, randomNumber } from "./helpers";
import { InputController } from "./input";
import { Vector2 } from "./vector2d";
import { Viewport } from "./viewport";
import { GraphWorld } from "./world";

// Just some random connection types to test input / output matching.

const ConnectionTypes = ["string", "number", "bool"] as const;
type ConnectionType = typeof ConnectionTypes[number];

type NodeConnection = {
  nodeId: string;
  connectionIndex: number;
};

type NodeConnector = {
  /** A list of any currently established connections */
  connections?: NodeConnection[];

  /** The connector type. For inputs, connections can only be made to output connectors
   *  w/ the same type and visa-versa.
   */
  type: ConnectionType;
};

export class GraphNode extends GraphEntity implements IRenderable {
  static styles = {
    nodeWidth: 250,
    nodeHeight: 175,
    headerHeight: 40,
    horizontalTextPadding: 20,
    verticalTextGap: 30,
    inputRadius: 12,
    nodeBgColor: "rgba(0, 0, 0, 1)",
    nodeHeaderColor: "white",
    nodeHoverColor: "#F79D5C",
  };

  id: string;
  inputs: NodeConnector[];
  outputs: NodeConnector[];
  width: number = GraphNode.styles.nodeWidth;
  height: number = GraphNode.styles.nodeHeight;
  isHoverCandidate = false;
  isHovering = false;
  isDragging = false;
  zIndex = 0;
  isColliding = false;

  constructor(position?: Vector2) {
    super(position);
    this.id = crypto.randomUUID();
    this.zIndex = GraphWorld.getWorld().nodes?.length;
    this.inputs = new Array(randomNumber(1, 5)).fill(0).map((i) => ({
      type: ConnectionTypes[randomNumber(0, ConnectionTypes.length)],
      connections: [],
    }));
    this.outputs = new Array(randomNumber(1, 5)).fill(0).map((i) => ({
      type: ConnectionTypes[randomNumber(0, ConnectionTypes.length)],
      connections: [],
    }));
    // this.inputs = [{ type: "🍎" }, { type: "🍊" }];
    // this.outputs = [{ type: "🍌" }, { type: "🍎" }];
  }

  isIntersecting(node: GraphNode) {
    const apos = this.transform.position;
    const aw = this.width;
    const ah = this.height;

    const bpos = node.transform.position;
    const bw = node.width;
    const bh = node.height;

    return (
      apos.x < bpos.x + bw &&
      apos.x + aw > bpos.x &&
      apos.y < bpos.y + bh &&
      apos.y + ah > bpos.y
    );
  }

  containsPoint(v: Vector2) {
    if (!v) return false;
    const pos = this.transform.position;
    const w = this.width;
    const h = this.height;
    return v.x >= pos.x && v.x <= pos.x + w && v.y >= pos.y && v.y <= pos.y + h;
  }

  tick() {
    const ic = InputController.getController();
    const mousePos = ic.getMousePosition();

    const nodes = GraphWorld.getWorld().nodes;

    // this.isColliding = nodes.some(
    //   (n) => n.id !== this.id && this.isIntersecting(n)
    // );

    // Check to see if we're currently hovering 'this' node
    this.isHoverCandidate = this.containsPoint(mousePos);

    // Find all other hovered nodes
    const competingNodes = nodes
      .filter((n) => n.isHoverCandidate && n.id !== this.id)
      .sort((a, b) => a.zIndex - b.zIndex);

    if (!competingNodes?.length && this.isHoverCandidate) {
      this.isHovering = true;
    } else {
      this.isHovering = competingNodes[competingNodes.length - 1] === this;
    }

    this.isDragging = ic.isMouseDown() && this.isHovering;

    if (this.isDragging) {
      this.transform.position.x = mousePos.x - this.width / 2;
      this.transform.position.y = mousePos.y - this.height / 2;
    }
  }

  private drawConnections(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    // ctx.setLineDash([8, 8]);
    // ctx.lineDashOffset = 4;
    // ctx.lineCap = "round";
    ctx.beginPath();

    const nodes = GraphWorld.getWorld().nodes;
    const nextNode = nodes[nodes.findIndex((n) => n.id === this.id) + 1];

    if (nextNode) {
      this.outputs.forEach((output, i) => {
        const lineOrigin = this.getOutputPosition(i);
        const lineTerminal = nextNode.getInputPosition(i);

        const cp1 = lineOrigin.lerp(lineTerminal, 0.5);
        const distance = lineOrigin.distanceTo(lineTerminal);
        const clamp = distance / 6;
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

        const gradient = ctx.createLinearGradient(
          lineOrigin.x,
          lineOrigin.y,
          lineTerminal.x,
          lineTerminal.y
        );

        // Add three color stops
        gradient.addColorStop(0, "#00DBDE");
        // gradient.addColorStop(0.5, "#fd1d1d");
        gradient.addColorStop(1, "#FC00FF");

        // Set the fill style and draw a rectangle
        ctx.strokeStyle = gradient;

        ctx.bezierCurveTo(
          cp1.x,
          cp1.y,
          cp2.x,
          cp2.y,
          lineTerminal.x,
          lineTerminal.y
        );
      });
    }

    ctx.stroke();
    ctx.closePath();
    ctx.lineWidth = 1;
  }

  drawInputs(ctx: CanvasRenderingContext2D) {
    this.inputs.forEach((_, i) => {
      const inputPosition = this.getInputPosition(i);
      const size = GraphNode.styles.inputRadius;

      drawRect(ctx, {
        x: inputPosition.x - size / 2,
        y: inputPosition.y - size / 2,
        width: size,
        height: size,
        fillColor: GraphNode.styles.nodeBgColor,
        strokeColor: "white",
      });
    });
  }

  drawOutputs(ctx: CanvasRenderingContext2D) {
    this.outputs.forEach((_, i) => {
      const inputPosition = this.getOutputPosition(i);
      drawCircle(ctx, {
        x: inputPosition.x,
        y: inputPosition.y,
        radius: GraphNode.styles.inputRadius / 2,
        fillColor: GraphNode.styles.nodeBgColor,
        strokeColor: "white",
      });
    });
  }

  drawNodeContent(ctx: CanvasRenderingContext2D) {
    // Draw input type strings next to the connectors
    this.inputs.forEach((input, i) => {
      const inputPosition = this.getInputPosition(i);
      const { actualBoundingBoxAscent } = ctx.measureText(input.type);
      drawText(ctx, input.type, {
        fillColor: "white",
        x: inputPosition.x + GraphNode.styles.horizontalTextPadding,
        y: inputPosition.y + actualBoundingBoxAscent / 3,
      });
    });

    // Draw output type strings next to the connectors
    this.outputs.forEach((output, i) => {
      const inputPosition = this.getOutputPosition(i);
      const { width, actualBoundingBoxAscent } = ctx.measureText(output.type);
      drawText(ctx, output.type, {
        // fillColor: "white",
        fillColor: "white",
        x: inputPosition.x - (width + GraphNode.styles.horizontalTextPadding),
        y: inputPosition.y + actualBoundingBoxAscent / 3,
      });
    });
  }

  getInputPosition(index: number) {
    // TODO: Remove this
    if (index > this.inputs?.length - 1) {
      return new Vector2(
        this.transform.position.x,
        this.transform.position.y +
          GraphNode.styles.headerHeight +
          this.inputs.length * 20
      );
    }

    // TODO: Keep this
    return new Vector2(
      this.transform.position.x,
      this.transform.position.y +
        GraphNode.styles.headerHeight +
        (index + 1) * 20
    );
  }

  getOutputPosition(index: number) {
    return new Vector2(
      this.transform.position.x + this.width,
      this.transform.position.y +
        GraphNode.styles.headerHeight +
        (index + 1) * 20
    );
  }

  render(ctx: CanvasRenderingContext2D) {
    this.drawConnections(ctx);

    ctx.fillStyle = GraphNode.styles.nodeHeaderColor;
    ctx.strokeStyle = "white";

    // const gradient = ctx.createLinearGradient(
    //   this.transform.position.x,
    //   this.transform.position.y,
    //   this.transform.position.x + this.width,
    //   this.transform.position.y + this.height
    // );

    // // Add three color stops
    // gradient.addColorStop(1, "#00DBDE");
    // // gradient.addColorStop(0.5, "#fd1d1d");
    // gradient.addColorStop(0, "#FC00FF");

    // ctx.fillStyle = gradient;

    ctx.fillRect(
      this.transform.position.x,
      this.transform.position.y,
      this.width,
      GraphNode.styles.headerHeight
    );

    this.drawInputs(ctx);
    this.drawOutputs(ctx);
    ctx.fillStyle = GraphNode.styles.nodeBgColor;
    ctx.strokeStyle = "#444444";

    ctx.beginPath();
    ctx.rect(
      this.transform.position.x,
      this.transform.position.y + GraphNode.styles.headerHeight,
      this.width,
      this.height - GraphNode.styles.headerHeight
    );

    ctx.fill();
    ctx.stroke();

    this.drawNodeContent(ctx);

    ctx.font = `${14}px monospace`;
    ctx.fillStyle = "black";
    ctx.fillText(
      `Node ${this.zIndex + 1}`,
      this.transform.position.x + GraphNode.styles.horizontalTextPadding,
      this.transform.position.y + GraphNode.styles.headerHeight / 1.75
    );

    ctx.fillStyle = "white";
  }
}
