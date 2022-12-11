<script lang="ts">
  import { onMount } from "svelte";
  import { Vector2 } from "./lib/math/vector2d";
  import CheckboxGroup from "./components/Inputs/CheckboxGroup.svelte";
  import { bind } from "svelte/internal";

  type Node = {
    position: Vector2;
    width: number;
    height: number;
    isHovering: boolean;
    isDragging: boolean;
  };

  let elementOptions = [
    "nodes",
    "lerp nodes (1)",
    "lerp nodes (2)",
    "lerp nodes (3)",
    "lines",
  ] as const;

  let visibleElements = [...elementOptions];

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let nodes: Node[] = [];

  setInterval(() => {
    step = step + 0.01;
  }, 2);

  let isMouseDown = false;
  let animateLerp = true;
  let step = 0;
  let t = 0.5;
  $: sinT = (Math.sin(step) + 1) / 2;

  function deriveLerpedNodes(_t: number, list: Node[]): Node[] {
    return [
      ...list
        .map((n, i) => {
          const n2 = list[i + 1];
          if (n && n2) {
            return {
              ...n,
              position: lerp(_t, n.position, n2.position),
              width: n.width,
              height: n.height,
            };
          } else {
            return null;
          }
        })
        .filter((n) => n !== null && typeof n !== "undefined"),
    ];
  }

  $: lerpNodes = deriveLerpedNodes(animateLerp ? sinT : t, nodes);
  $: lerpNodes2 = deriveLerpedNodes(animateLerp ? sinT : t, lerpNodes);
  $: lerpNodes3 = deriveLerpedNodes(animateLerp ? sinT : t, lerpNodes2);

  $: document.body.style.cursor = nodes.some((n) => n.isHovering)
    ? "grab"
    : "crosshair";

  onMount(() => {
    ctx = canvas.getContext("2d");

    canvas.addEventListener("mouseup", (e) => {
      isMouseDown = false;

      if (nodes.some((n) => n.isHovering && !n.isDragging)) return;

      if (nodes.some((n) => n.isDragging)) {
        nodes = nodes.map((n) => ({ ...n, isDragging: false }));
      } else {
        nodes = [
          ...nodes,
          {
            position: getMousePos(e),
            width: 20,
            height: 20,
            isHovering: false,
            isDragging: false,
          },
        ];
      }
    });

    canvas.addEventListener("mousedown", (e) => {
      isMouseDown = true;
      const mousePos = getMousePos(e);

      nodes.forEach((n, i) => {
        if (n.isHovering && n.position.distanceTo(mousePos) <= n.width) {
          nodes = nodes.map((_n, _i) =>
            i === _i ? { ..._n, isDragging: true } : _n
          );
        }
      });
    });

    canvas.addEventListener("mousemove", (e) => {
      const mousePos = getMousePos(e);

      if (isMouseDown && nodes.some((n) => n.isDragging)) {
        nodes = nodes.map((n) =>
          n.isDragging ? { ...n, position: mousePos } : n
        );
      } else {
        nodes.forEach((n, i) => {
          if (!n.isHovering && n.position.distanceTo(mousePos) <= n.width) {
            nodes = nodes.map((_n, _i) =>
              i === _i ? { ..._n, isHovering: true } : _n
            );
          } else {
            if (n.isHovering && n.position.distanceTo(mousePos) > n.width) {
              nodes = nodes.map((_n, _i) =>
                i === _i ? { ..._n, isHovering: false } : _n
              );
            }
          }
        });
      }
    });
  });

  function lerp(t: number, a: Vector2, b: Vector2) {
    return a.scale(t).add(b.scale(1.0 - t));
  }

  function getMousePos(event: MouseEvent): Vector2 {
    const canvasBounds = canvas.getBoundingClientRect();
    const scaleX = canvas.width / canvasBounds.width;
    const scaleY = canvas.height / canvasBounds.height;
    return new Vector2(
      (event.clientX - canvasBounds.left) * scaleX,
      (event.clientY - canvasBounds.top) * scaleY
    );
  }

  function drawDebugInfo() {
    ctx.fillStyle = "white";
    ctx.font = "20px monospace";
    ctx.fillText(`num control nodes: ${nodes?.length}`, 40, 40);
    ctx.fillText(
      `num derived lerp nodes: ${
        lerpNodes?.length + lerpNodes2?.length + lerpNodes3?.length
      }`,
      40,
      60
    );
    ctx.fillText(`is mouse down?: ${isMouseDown}`, 40, 80);
  }

  // clear color - #111111
  $: {
    if (ctx) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }

  $: {
    if (ctx) {
      ctx.fillStyle = "#111111";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // drawDebugInfo();

      if (visibleElements.includes("nodes")) {
        for (const node of nodes) {
          ctx.fillStyle = node.isDragging ? "purple" : "white";
          ctx.beginPath();
          ctx.arc(
            node.position.x,
            node.position.y,
            node.width,
            0,
            2 * Math.PI,
            false
          );
          ctx.fill();
          ctx.closePath();
        }
      }

      if (visibleElements.includes("lines")) {
        nodes.forEach((n, i) => {
          let n2 = nodes[i + 1];
          if (n && n2) {
            ctx.strokeStyle = "white";
            ctx.beginPath();
            ctx.moveTo(n.position.x, n.position.y);
            ctx.lineTo(n2.position.x, n2.position.y);
            ctx.stroke();
            ctx.closePath();
          }
        });
      }

      if (visibleElements.includes("lerp nodes (1)") && lerpNodes?.length > 0) {
        for (const node of lerpNodes) {
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(
            node.position.x,
            node.position.y,
            node.width / 2,
            0,
            Math.PI * 2,
            false
          );
          ctx.fill();
          ctx.closePath();
        }
      }

      if (
        visibleElements.includes("lerp nodes (2)") &&
        lerpNodes2?.length > 0
      ) {
        for (const node of lerpNodes2) {
          ctx.fillStyle = "green";
          ctx.beginPath();
          ctx.arc(
            node.position.x,
            node.position.y,
            node.width / 2,
            0,
            Math.PI * 2,
            false
          );
          ctx.fill();
          ctx.closePath();
        }
      }

      if (
        visibleElements.includes("lerp nodes (3)") &&
        lerpNodes3?.length > 0
      ) {
        for (const node of lerpNodes3) {
          ctx.fillStyle = "blue";
          ctx.beginPath();
          ctx.arc(
            node.position.x,
            node.position.y,
            node.width / 2,
            0,
            Math.PI * 2,
            false
          );
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }
</script>

<div class="toolbar">
  <div class="form-field">
    <label for="lerp">Lerp value {t}</label>
    <input
      name="lerp"
      type="range"
      min={0}
      max={1}
      step={0.001}
      bind:value={t}
    />
  </div>

  <div class="form-field">
    <label>
      Animate Lerp? {animateLerp.toString()}
      <input type="checkbox" bind:checked={animateLerp} /></label
    >
  </div>

  <div class="form-field">
    <CheckboxGroup
      name="Element Visibility"
      options={elementOptions}
      bind:group={visibleElements}
    />
  </div>

  <div class="form-field">
    <button
      on:click={() => {
        nodes = [];
      }}>Reset Nodes</button
    >
  </div>
</div>

<canvas
  width={window.innerWidth}
  height={window.innerHeight}
  bind:this={canvas}
/>

<style>
  .toolbar {
    background: transparent;
    width: 300px;
    color: white;
    position: absolute;
  }
  .form-field {
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }
  canvas {
    width: 1920px;
    height: 1080px;
  }
</style>
