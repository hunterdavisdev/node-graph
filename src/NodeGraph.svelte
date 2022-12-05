<script lang="ts">
  import { onMount } from "svelte";
  import { Vector2 } from "./lib/vector2d";
  import CheckboxGroup from "./components/Inputs/CheckboxGroup.svelte";
  import { bind } from "svelte/internal";
  import { Viewport } from "./lib/viewport";
  import { GraphWorld } from "./lib/world";

  let elementOptions = [] as const;
  let visibleElements = [...elementOptions];

  let canvas: HTMLCanvasElement;
  let world = GraphWorld.getWorld();
  let viewport: Viewport;
  let isMouseDown = false;

  //////////////

  $: document.body.style.cursor = world.nodes.some((n) => n.isHovering)
    ? "grab"
    : "crosshair";

  onMount(() => {
    viewport = new Viewport(canvas);
    viewport.clear("rgba(0, 0, 0, 0)");
    viewport.render();
  });
</script>

<div class="toolbar">
  <!-- <div class="form-field">
    <CheckboxGroup
      name="Element Visibility"
      options={elementOptions}
      bind:group={visibleElements}
    />
  </div> -->

  <div class="form-field">
    <button
      on:click={() => {
        world.nodes = [];
      }}>Reset Graph</button
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
    position: absolute;
    right: 1;
    top: 1;
    width: 300px;
    color: white;
  }
  .form-field {
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }
  canvas {
    width: 100vw;
    height: 100vh;
  }
</style>
