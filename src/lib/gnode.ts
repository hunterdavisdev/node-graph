import { Camera } from "./camera";
import { GraphEntity, type IRenderable } from "./entity";
import { drawCircle, drawRect, drawText, randomNumber } from "./helpers";
import { Vector2 } from "./math/vector2d";
import type { GraphWorld } from "./world";

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
  isVisible = false;

  constructor(private world: GraphWorld, position?: Vector2) {
    super(position);

    this.id = crypto.randomUUID();
    this.zIndex = world.nodes?.length;
    this.inputs = new Array(randomNumber(1, 5)).fill(0).map((i) => ({
      type: ConnectionTypes[randomNumber(0, ConnectionTypes.length)],
      connections: [],
    }));
    this.outputs = new Array(randomNumber(1, 5)).fill(0).map((i) => ({
      type: ConnectionTypes[randomNumber(0, ConnectionTypes.length)],
      connections: [],
    }));
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

    const ctx = this.world.getGraph().getViewport().getContext();

    const camera = this.world.getCamera();
    const pos = this.transform.position;

    // drawRect(ctx, {
    //   x: this.transform.position.x,
    //   y: this.transform.position.y,
    //   width: 5,
    //   height: 5,
    //   fillColor: "red",
    // });
    const w = this.width;
    const h = this.height;
    return v.x >= pos.x && v.x <= pos.x + w && v.y >= pos.y && v.y <= pos.y + h;
  }

  tick() {
    const camera = this.world.getCamera();
    const ic = this.world.getGraph().getInputController();
    const mousePos = ic.getMousePosition();
    const worldMousePos = camera.screenToWorld(mousePos);

    const nodes = this.world.nodes;

    // this.isColliding = nodes.some(
    //   (n) => n.id !== this.id && this.isIntersecting(n)
    // );

    // Check to see if we're currently hovering 'this' node

    this.isHoverCandidate = this.containsPoint(worldMousePos);

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
      this.transform.position.x = worldMousePos.x - this.width / 2;
      this.transform.position.y = worldMousePos.y - this.height / 2;
    }
  }

  private drawConnections(ctx: CanvasRenderingContext2D) {
    const camera = this.world.getCamera();

    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2 * camera.zoom;
    // ctx.setLineDash([8, 8]);
    // ctx.lineDashOffset = 4;
    // ctx.lineCap = "round";
    ctx.beginPath();

    const nodes = this.world.nodes;
    const nextNode = nodes[nodes.findIndex((n) => n.id === this.id) + 1];

    if (nextNode) {
      this.outputs.forEach((output, i) => {
        const lineOrigin = camera.worldToScreen(this.getOutputPosition(i));
        const lineTerminal = camera.worldToScreen(nextNode.getInputPosition(i));

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
    const camera = this.world.getCamera();

    this.inputs.forEach((_, i) => {
      const inputPosition = camera.worldToScreen(this.getInputPosition(i));
      const size = GraphNode.styles.inputRadius * camera.zoom;

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
    const camera = this.world.getCamera();

    this.outputs.forEach((_, i) => {
      const inputPosition = camera.worldToScreen(this.getOutputPosition(i));
      drawCircle(ctx, {
        x: inputPosition.x,
        y: inputPosition.y,
        radius: (GraphNode.styles.inputRadius / 2) * camera.zoom,
        fillColor: GraphNode.styles.nodeBgColor,
        strokeColor: "white",
      });
    });
  }

  drawNodeContent(ctx: CanvasRenderingContext2D) {
    const camera = this.world.getCamera();

    // Draw input type strings next to the connectors
    this.inputs.forEach((input, i) => {
      const inputPosition = camera.worldToScreen(this.getInputPosition(i));

      const { actualBoundingBoxAscent } = ctx.measureText(input.type);
      drawText(ctx, input.type, {
        fillColor: "white",
        x: inputPosition.x + GraphNode.styles.horizontalTextPadding,
        y: inputPosition.y + actualBoundingBoxAscent / 3,
      });
    });

    // Draw output type strings next to the connectors
    this.outputs.forEach((output, i) => {
      const inputPosition = camera.worldToScreen(this.getOutputPosition(i));
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
    const camera = this.world.getCamera();
    const screenPos = camera.worldToScreen(this.transform.position);

    this.drawConnections(ctx);

    ctx.fillStyle = this.isVisible
      ? "yellow"
      : GraphNode.styles.nodeHeaderColor;
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
      screenPos.x,
      screenPos.y,
      this.width * camera.zoom,
      GraphNode.styles.headerHeight * camera.zoom
    );

    this.drawInputs(ctx);
    this.drawOutputs(ctx);

    ctx.fillStyle = GraphNode.styles.nodeBgColor;
    ctx.strokeStyle = "#444444";

    ctx.beginPath();
    ctx.rect(
      screenPos.x,
      screenPos.y + GraphNode.styles.headerHeight * camera.zoom,
      this.width * camera.zoom,
      (this.height - GraphNode.styles.headerHeight) * camera.zoom
    );

    ctx.fill();
    ctx.stroke();

    this.drawNodeContent(ctx);

    ctx.font = `${14 * camera.zoom}px monospace`;
    ctx.fillStyle = "black";
    ctx.fillText(
      `Node ${this.zIndex + 1}`,
      screenPos.x + GraphNode.styles.horizontalTextPadding * camera.zoom,
      screenPos.y + (GraphNode.styles.headerHeight / 1.75) * camera.zoom
    );

    ctx.fillStyle = "white";
  }
}
