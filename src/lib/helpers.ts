import { Vector2 } from "./vector2d";

type RenderCtx = CanvasRenderingContext2D;

type CommonRenderingOptions = {
  x: number;
  y: number;
  fillColor?: string;
  strokeColor?: string;
};

function memFill(
  ctx: RenderCtx,
  fillColor: string,
  fillCallback?: (ctx: RenderCtx) => void
) {
  const current = ctx.fillStyle;
  ctx.fillStyle = fillColor;
  if (fillCallback) fillCallback(ctx);
  else ctx.fill();
  ctx.fillStyle = current;
}

function memStroke(
  ctx: RenderCtx,
  strokeStyle: string,
  strokeCallback?: (ctx: RenderCtx) => void
) {
  const current = ctx.strokeStyle;
  ctx.strokeStyle = strokeStyle;
  if (strokeCallback) strokeCallback(ctx);
  else ctx.stroke();
  ctx.strokeStyle = current;
}

export function drawText(
  ctx: RenderCtx,
  text: string,
  options: CommonRenderingOptions & { maxWidth?: number }
) {
  if (options.fillColor) {
    memFill(ctx, options.fillColor, (ctx) =>
      ctx.fillText(text, options.x, options.y, options?.maxWidth)
    );
  }

  if (options.strokeColor) {
    memStroke(ctx, options.strokeColor, (ctx) =>
      ctx.strokeText(text, options.x, options.y, options?.maxWidth)
    );
  }
}

export function drawCircle(
  ctx: RenderCtx,
  options: CommonRenderingOptions & { radius: number }
) {
  ctx.beginPath();
  ctx.arc(options.x, options.y, options.radius, 0, Math.PI * 180, false);
  if (options.fillColor) memFill(ctx, options.fillColor);
  if (options.strokeColor) memStroke(ctx, options.strokeColor);
  ctx.closePath();
}

export function drawRect(
  ctx: RenderCtx,
  options: CommonRenderingOptions & { width: number; height: number }
) {
  ctx.beginPath();
  ctx.rect(options.x, options.y, options.width, options.height);
  if (options.fillColor) memFill(ctx, options.fillColor);
  if (options.strokeColor) memStroke(ctx, options.strokeColor);
  ctx.closePath();
}

export function randomNumber(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min) + min);
}
