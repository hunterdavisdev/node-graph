export class Vector2 {
  constructor(public x: number, public y: number) {
    this.x = x;
    this.y = y;
  }

  add(v: Vector2) {
    return new Vector2(this.x + v.x, this.y + v.y);
  }

  scale(scalar: number) {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  magnitude() {
    return Math.sqrt(Math.pow(this.x, 2) * Math.pow(this.y, 2));
  }

  distanceTo(v: Vector2) {
    return Math.sqrt(Math.pow(v.x - this.x, 2) + Math.pow(v.y - this.y, 2));
  }

  lerp(v: Vector2, t: number) {
    return this.scale(t).add(v.scale(1.0 - t));
  }

  toString() {
    return `{ x: ${this.x}, y: ${this.y} }`;
  }

  static zero() {
    return new Vector2(0, 0);
  }
}
