import type { NodeGraph } from "./graph";

export class Chrono {
  private deltaTime = 0.0;
  private previousTime: DOMHighResTimeStamp;
  private fps = 0;

  constructor(private graph: NodeGraph) {
    this.graph = graph;
  }

  tick(time: DOMHighResTimeStamp) {
    const dt = this.calculateFrameDelta(time);
    this.deltaTime += dt;
  }

  private calculateFrameDelta(time?: DOMHighResTimeStamp) {
    if (!this.previousTime) {
      this.previousTime = time;
      this.fps = 0;
      return 0;
    }

    const delta = (time - this.previousTime) / 1000;
    this.previousTime = time;
    this.fps = 1 / delta;
    return delta;
  }

  getFPS() {
    return this.fps;
  }

  getDeltaTime() {
    return this.deltaTime;
  }

  getPreviousFrameTime() {
    return this.previousTime;
  }
}
