<script lang="ts">
  import { onMount } from "svelte";
  import Menu from "./components/Menu.svelte";
  import { Viewport } from "./lib/viewport";
  import { GraphWorld } from "./lib/world";

  let menuOpen = false;
  let menuX = 0;
  let menuY = 0;

  let canvas: HTMLCanvasElement;
  let world = GraphWorld.getWorld();
  let viewport: Viewport;

  onMount(() => {
    viewport = new Viewport(canvas, {
      onContextMenuRequested: (e) => {
        menuX = e.clientX;
        menuY = e.clientY;
        menuOpen = true;
        console.log({ open });
      },
    });
    viewport.render();
  });
</script>

<div class="toolbar">
  <Menu
    bind:open={menuOpen}
    bind:x={menuX}
    bind:y={menuY}
    onAddNode={() => {
      GraphWorld.getWorld().addNodeAtMousePosition();
      menuOpen = false;
    }}
    onResetGraph={() => {
      world.nodes = [];
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
