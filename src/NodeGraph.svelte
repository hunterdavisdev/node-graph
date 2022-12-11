<script lang="ts">
  import { onMount } from "svelte";
  import Menu from "./components/Menu.svelte";
  import { GraphWorld } from "./lib/world";
  import { NodeGraph } from "./lib/graph";

  let menuOpen = false;
  let menuX = 0;
  let menuY = 0;

  let graph: NodeGraph;
  let canvas: HTMLCanvasElement;

  onMount(() => {
    graph = new NodeGraph(canvas, {
      onContextMenuRequested: (e) => {
        menuX = e.clientX;
        menuY = e.clientY;
        menuOpen = true;
        console.log({ open });
      },
    });

    graph.init();
    graph.update();
  });
</script>

<div class="toolbar">
  <Menu
    bind:open={menuOpen}
    bind:x={menuX}
    bind:y={menuY}
    onAddNode={() => {
      graph.getWorld().addNodeAtMousePosition();
      menuOpen = false;
    }}
    onResetGraph={() => {
      graph.getWorld().nodes = [];
      menuOpen = false;
    }}
  />
</div>

<canvas
  width={window.innerWidth}
  height={window.innerHeight}
  bind:this={canvas}
/>

<style>
  .toolbar {
    background: transparent;
    position: absolute;
    right: 1;
    top: 1;
    width: 300px;
    color: white;
  }
  canvas {
    width: 100vw;
    height: 100vh;
  }
</style>
