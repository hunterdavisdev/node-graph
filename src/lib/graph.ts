import { Viewport } from "./viewport";
import { Chrono } from "./time";
import type { init } from "svelte/internal";
import { GraphWorld } from "./world";
import { InputController } from "./input";

export type GraphConfig = {
  onContextMenuRequested: (e: MouseEvent) => void;
};

export class NodeGraph {
  private inputController: InputController;
  private world: GraphWorld;
  private viewport: Viewport;
  private chrono: Chrono;

  constructor(canvas: HTMLCanvasElement, private config: GraphConfig) {
    this.viewport = new Viewport(this, canvas);
    this.chrono = new Chrono(this);
    this.inputController = new InputController(this);
    this.world = new GraphWorld(this);
  }

  init() {
    this.inputController.initializeListeners();
    this.world.seedNodes(10);
  }

  // Only need to call this once.
  update(time?: DOMHighResTimeStamp) {
    if (!time) {
      window.requestAnimationFrame(this.update.bind(this));
      return;
    }

    this.chrono.tick(time);
    this.inputController.tick();
    this.world.tick();
    this.viewport.render();
    window.requestAnimationFrame(this.update.bind(this));
  }

  getWorld() {
    return this.world;
  }

  getViewport() {
    return this.viewport;
  }

  getInputController() {
    return this.inputController;
  }

  getConfig() {
    return this.config;
  }

  getChrono() {
    return this.chrono;
  }
}
