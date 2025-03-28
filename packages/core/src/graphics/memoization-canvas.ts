import rough from "roughjs";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import type { Point } from "roughjs/bin/geometry";
import { getStroke } from "perfect-freehand";
import {
  FillStyle,
  Canvas,
  CanvasState,
  CanvasTextMetric,
  SVGPath,
  pathToString,
} from "./graphics";
import { roughDraw } from "./roughjs-draw";
import * as geometry from "./geometry";
import { Color } from "./const";
import { getSvgPathFromStroke } from "./utils";

const MIN_HACHURE_GAP = 4;

/**
 * Drawing Object
 */
type DO =
  | LineDO
  | StrokeRectDO
  | FillRectDO
  | StrokeRoundRectDO
  | FillRoundRectDO
  | StrokeEllipseDO
  | FillEllipseDO
  | PolylineDO
  | StrokeCurveDO
  | FillCurveDO
  | StrokePolygonDO
  | FillPolygonDO
  | StrokeArcDO
  | FillArcDO
  | StrokePathDO
  | FillPathDO
  | strokeFreehandDO
  | FillTextDO
  | DrawImageDO
  | RoughDO;

type DOType =
  | "line"
  | "strokeRect"
  | "fillRect"
  | "strokeRoundRect"
  | "fillRoundRect"
  | "strokeEllipse"
  | "fillEllipse"
  | "polyline"
  | "strokeCurve"
  | "fillCurve"
  | "strokePolygon"
  | "fillPolygon"
  | "strokeArc"
  | "fillArc"
  | "strokePath"
  | "fillPath"
  | "strokeFreehand"
  | "fillText"
  | "drawImage"
  | "rough";

interface BaseDO {
  type: DOType;
}

interface LineDO extends BaseDO {
  type: "line";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface StrokeRectDO extends BaseDO {
  type: "strokeRect";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FillRectDO extends BaseDO {
  type: "fillRect";
  fillColor: string;
  fillStyle: string;
  alpha: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface StrokeRoundRectDO extends BaseDO {
  type: "strokeRoundRect";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number[];
}

interface FillRoundRectDO extends BaseDO {
  type: "fillRoundRect";
  fillColor: string;
  fillStyle: string;
  alpha: number;
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number[];
}

interface StrokeEllipseDO extends BaseDO {
  type: "strokeEllipse";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FillEllipseDO extends BaseDO {
  type: "fillEllipse";
  fillColor: string;
  fillStyle: string;
  alpha: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface PolylineDO extends BaseDO {
  type: "polyline";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  path: number[][];
}

interface StrokeCurveDO extends BaseDO {
  type: "strokeCurve";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  path: number[][];
}

interface FillCurveDO extends BaseDO {
  type: "fillCurve";
  fillColor: string;
  fillStyle: string;
  alpha: number;
  path: number[][];
}

interface StrokePolygonDO extends BaseDO {
  type: "strokePolygon";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  path: number[][];
}

interface FillPolygonDO extends BaseDO {
  type: "fillPolygon";
  fillColor: string;
  fillStyle: string;
  alpha: number;
  path: number[][];
}

interface StrokeArcDO extends BaseDO {
  type: "strokeArc";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  x: number;
  y: number;
  r: number;
  startAngle: number;
  endAngle: number;
}

interface FillArcDO extends BaseDO {
  type: "fillArc";
  fillColor: string;
  fillStyle: string;
  alpha: number;
  x: number;
  y: number;
  r: number;
  startAngle: number;
  endAngle: number;
}

interface StrokePathDO extends BaseDO {
  type: "strokePath";
  strokeColor: string;
  strokeWidth: number;
  strokeLineDash: number[];
  alpha: number;
  path: SVGPath;
}

interface FillPathDO extends BaseDO {
  type: "fillPath";
  fillColor: string;
  fillStyle: string;
  alpha: number;
  path: SVGPath;
}

interface strokeFreehandDO extends BaseDO {
  type: "strokeFreehand";
  strokeColor: string;
  alpha: number;
  path2d: Path2D;
  pathData: string;
}

interface FillTextDO extends BaseDO {
  type: "fillText";
  fontColor: string;
  alpha: number;
  font: string;
  x: number;
  y: number;
  text: string;
}

interface DrawImageDO extends BaseDO {
  type: "drawImage";
  alpha: number;
  image: HTMLImageElement;
  x: number;
  y: number;
  w: number;
  h: number;
  radius: number[];
}

interface RoughDO extends BaseDO {
  type: "rough";
  alpha: number;
  rd: Drawable;
}

/**
 * Memoization Canvas
 */
class MemoizationCanvas {
  canvas: Canvas = null!;
  stateStack: CanvasState[];
  do: DO[];
  generator: RoughGenerator;
  strokeColor: string;
  strokeWidth: number;
  strokePattern: number[];
  fillColor: string;
  fillStyle: string;
  fontColor: string;
  font: string;
  alpha: number;
  roughness: number;

  constructor() {
    this.do = [];
    this.stateStack = [];
    this.generator = rough.generator();
    this.strokeColor = Color.FOREGROUND;
    this.strokeWidth = 1;
    this.strokePattern = []; // solid
    this.fillColor = Color.BACKGROUND;
    this.fillStyle = FillStyle.SOLID;
    this.fontColor = Color.FOREGROUND;
    this.font = "13px sans-serif";
    this.alpha = 1.0;
    this.roughness = 0;
  }

  /**
   * Store current canvas state into a stack
   */
  storeState() {
    const state: CanvasState = {
      strokeColor: this.strokeColor,
      strokeWidth: this.strokeWidth,
      strokePattern: this.strokePattern,
      fillColor: this.fillColor,
      fillStyle: this.fillStyle,
      fontColor: this.fontColor,
      font: this.font,
      alpha: this.alpha,
      roughness: this.roughness,
    };
    this.stateStack.push(state);
  }

  /**
   * Restore the canvas states from a stack
   */
  restoreState() {
    const state = this.stateStack.pop();
    if (state) {
      this.strokeColor = state.strokeColor;
      this.strokeWidth = state.strokeWidth;
      this.strokePattern = state.strokePattern;
      this.fillColor = state.fillColor;
      this.fillStyle = state.fillStyle;
      this.fontColor = state.fontColor;
      this.font = state.font;
      this.alpha = state.alpha;
      this.roughness = state.roughness;
    }
  }

  clear() {
    this.do = [];
  }

  setCanvas(canvas: Canvas) {
    this.canvas = canvas;
  }

  /**
   * Set stroke color
   */
  setStrokeColor(color: string) {
    this.strokeColor = color;
    return this;
  }

  /**
   * Set stroke width
   */
  setStrokeWidth(width: number) {
    this.strokeWidth = width;
    return this;
  }

  /**
   * Set stroke pattern
   */
  setStrokePattern(pattern: number[]) {
    this.strokePattern = pattern;
    return this;
  }

  /**
   * Set fill color
   */
  setFillColor(color: string) {
    this.fillColor = color;
    return this;
  }

  /**
   * Set fill style
   */
  setFillStyle(style: string) {
    this.fillStyle = style;
    return this;
  }

  /**
   * Set font color
   */
  setFontColor(color: string) {
    this.fontColor = color;
    return this;
  }

  /**
   * Set font
   */
  setFont(font: string) {
    this.font = font;
    return this;
  }

  /**
   * Set alpha
   */
  setAlpha(alpha: number) {
    this.alpha = alpha;
    return this;
  }

  /**
   * Set roughness
   */
  setRoughness(roughness: number) {
    this.roughness = roughness;
    return this;
  }

  /**
   * Draw a line
   */
  line(x1: number, y1: number, x2: number, y2: number, seed: number = 1) {
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const rd = this.generator.line(x1, y1, x2, y2, {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "line",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          x1,
          y1,
          x2,
          y2,
        });
      }
    }
    return this;
  }

  /**
   * Draw a rect lines
   */
  strokeRect(x1: number, y1: number, x2: number, y2: number, seed: number = 1) {
    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const rd = this.generator.rectangle(x, y, w, h, {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          disableMultiStroke: this.strokePattern.length > 1,
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "strokeRect",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          x,
          y,
          w,
          h,
        });
      }
    }
    return this;
  }

  /**
   * Draw a filled rect
   */
  fillRect(x1: number, y1: number, x2: number, y2: number, seed: number = 1) {
    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    if (this.roughness > 0 || this.fillStyle !== FillStyle.SOLID) {
      const rd = this.generator.rectangle(x, y, w, h, {
        seed,
        roughness: this.roughness,
        fill: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        fillLineDash: [],
        hachureGap: Math.max(MIN_HACHURE_GAP, this.strokeWidth * 3),
        stroke: this.canvas.resolveColor("$transparent"),
        strokeWidth: this.strokeWidth,
      });
      this.do.push({ type: "rough", alpha: this.alpha, rd });
    } else {
      this.do.push({
        type: "fillRect",
        fillColor: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        alpha: this.alpha,
        x,
        y,
        w,
        h,
      });
    }
    return this;
  }

  /**
   * Draw a rect
   */
  rect(x1: number, y1: number, x2: number, y2: number, seed: number = 1) {
    this.fillRect(x1, y1, x2, y2, seed);
    this.strokeRect(x1, y1, x2, y2, seed);
    return this;
  }

  /**
   * Draw a round rect lines
   */
  strokeRoundRect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number | number[],
    seed: number = 1
  ) {
    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const rs = Array.isArray(radius)
      ? radius
      : [radius, radius, radius, radius];
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const rd = this.generator.path(
          `M ${x + rs[0]},${y} 
           H ${x + w - rs[1]} 
           A ${rs[1]},${rs[1]} 0 0 1 ${x + w},${y + rs[1]} 
           V ${y + h - rs[2]} 
           A ${rs[2]},${rs[2]} 0 0 1 ${x + w - rs[2]},${y + h} 
           H ${x + rs[3]} 
           A ${rs[3]},${rs[3]} 0 0 1 ${x},${y + h - rs[3]} 
           V ${y + rs[0]} 
           A ${rs[0]},${rs[0]} 0 0 1 ${x + rs[0]},${y} 
           Z`,
          {
            seed,
            roughness: this.roughness,
            stroke: this.canvas.resolveColor(this.strokeColor),
            strokeWidth: this.strokeWidth,
            strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
            disableMultiStroke: this.strokePattern.length > 1,
            preserveVertices: true,
          }
        );
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "strokeRoundRect",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          x,
          y,
          w,
          h,
          radius: rs,
        });
      }
    }
    return this;
  }

  /**
   * Draw a filled round rect
   */
  fillRoundRect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number | number[],
    seed: number = 1
  ) {
    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const rs = Array.isArray(radius)
      ? radius
      : [radius, radius, radius, radius];
    if (this.roughness > 0 || this.fillStyle !== FillStyle.SOLID) {
      const rd = this.generator.path(
        `M ${x + rs[0]},${y} 
         H ${x + w - rs[1]} 
         A ${rs[1]},${rs[1]} 0 0 1 ${x + w},${y + rs[1]} 
         V ${y + h - rs[2]} 
         A ${rs[2]},${rs[2]} 0 0 1 ${x + w - rs[2]},${y + h} 
         H ${x + rs[3]} 
         A ${rs[3]},${rs[3]} 0 0 1 ${x},${y + h - rs[3]} 
         V ${y + rs[0]} 
         A ${rs[0]},${rs[0]} 0 0 1 ${x + rs[0]},${y} 
         Z`,
        {
          seed,
          roughness: this.roughness,
          fill: this.canvas.resolveColor(this.fillColor),
          fillStyle: this.fillStyle,
          fillLineDash: [],
          hachureGap: Math.max(MIN_HACHURE_GAP, this.strokeWidth * 3),
          stroke: this.canvas.resolveColor("$transparent"),
          strokeWidth: this.strokeWidth,
          preserveVertices: true,
        }
      );
      this.do.push({ type: "rough", alpha: this.alpha, rd });
    } else {
      this.do.push({
        type: "fillRoundRect",
        fillColor: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        alpha: this.alpha,
        x,
        y,
        w,
        h,
        radius: rs,
      });
    }
    return this;
  }

  /**
   * Draw a round rect
   */
  roundRect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    radius: number | number[],
    seed: number = 1
  ) {
    this.fillRoundRect(x1, y1, x2, y2, radius, seed);
    this.strokeRoundRect(x1, y1, x2, y2, radius, seed);
    return this;
  }

  /**
   * Draw an ellipse
   */
  strokeEllipse(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    seed: number = 1
  ) {
    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const xm = x + w / 2.0;
    const ym = y + h / 2.0;
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const rd = this.generator.ellipse(xm, ym, w, h, {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          disableMultiStroke: this.strokePattern.length > 1,
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "strokeEllipse",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          x,
          y,
          w,
          h,
        });
      }
    }
    return this;
  }

  /**
   * Draw a filled ellipse
   */
  fillEllipse(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    seed: number = 1
  ) {
    const x = x1 < x2 ? x1 : x2;
    const y = y1 < y2 ? y1 : y2;
    const w = Math.abs(x2 - x1);
    const h = Math.abs(y2 - y1);
    const xm = x + w / 2.0;
    const ym = y + h / 2.0;
    if (this.roughness > 0 || this.fillStyle !== FillStyle.SOLID) {
      const rd = this.generator.ellipse(xm, ym, w, h, {
        seed,
        roughness: this.roughness,
        fill: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        fillLineDash: [],
        hachureGap: Math.max(MIN_HACHURE_GAP, this.strokeWidth * 3),
        stroke: this.canvas.resolveColor("$transparent"),
        strokeWidth: this.strokeWidth,
      });
      this.do.push({ type: "rough", alpha: this.alpha, rd });
    } else {
      this.do.push({
        type: "fillEllipse",
        fillColor: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        alpha: this.alpha,
        x,
        y,
        w,
        h,
      });
    }
    return this;
  }

  /**
   * Draw an ellipse
   */
  ellipse(x1: number, y1: number, x2: number, y2: number, seed: number = 1) {
    this.fillEllipse(x1, y1, x2, y2, seed);
    this.strokeEllipse(x1, y1, x2, y2, seed);
    return this;
  }

  /**
   * Draw polyline
   */
  polyline(path: number[][], seed: number = 1) {
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const rd = this.generator.linearPath(path as Point[], {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          disableMultiStroke: this.strokePattern.length > 1,
          preserveVertices: true,
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "polyline",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          path: path,
        });
      }
    }
    return this;
  }

  /**
   * Draw curved lines
   */
  strokeCurve(path: number[][], seed: number = 1) {
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const rd = this.generator.curve(path as Point[], {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          disableMultiStroke: this.strokePattern.length > 1,
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "strokeCurve",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          path: path,
        });
      }
    }
    return this;
  }

  /**
   * Draw filled curved lines
   */
  fillCurve(path: number[][], seed: number = 1) {
    if (this.roughness > 0 || this.fillStyle !== FillStyle.SOLID) {
      const rd = this.generator.curve([...path, path[0]] as Point[], {
        seed,
        roughness: this.roughness,
        fill: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        fillLineDash: [],
        hachureGap: Math.max(MIN_HACHURE_GAP, this.strokeWidth * 3),
        stroke: this.canvas.resolveColor("$transparent"),
        strokeWidth: this.strokeWidth,
      });
      this.do.push({ type: "rough", alpha: this.alpha, rd });
    } else {
      this.do.push({
        type: "fillCurve",
        fillColor: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        alpha: this.alpha,
        path: path,
      });
    }
    return this;
  }

  /**
   * Draw a curve
   */
  curve(path: number[][], seed: number = 1) {
    this.fillCurve(path, seed);
    this.strokeCurve(path, seed);
    return this;
  }

  /**
   * Draw polygon
   */
  strokePolygon(path: number[][], seed: number = 1) {
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const rd = this.generator.polygon(path as Point[], {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          disableMultiStroke: this.strokePattern.length > 1,
          preserveVertices: true,
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "strokePolygon",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          path: path,
        });
      }
    }
    return this;
  }

  /**
   * Draw filled polygon
   */
  fillPolygon(path: number[][], seed: number = 1) {
    if (this.roughness > 0 || this.fillStyle !== FillStyle.SOLID) {
      const rd = this.generator.polygon(path as Point[], {
        seed,
        roughness: this.roughness,
        fill: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        fillLineDash: [],
        hachureGap: Math.max(MIN_HACHURE_GAP, this.strokeWidth * 3),
        stroke: this.canvas.resolveColor("$transparent"),
        strokeWidth: this.strokeWidth,
        preserveVertices: true,
      });
      this.do.push({ type: "rough", alpha: this.alpha, rd });
    } else {
      this.do.push({
        type: "fillPolygon",
        fillColor: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        alpha: this.alpha,
        path: path,
      });
    }
    return this;
  }

  /**
   * Draw a polygon
   */
  polygon(path: number[][], seed: number = 1) {
    this.fillPolygon(path, seed);
    this.strokePolygon(path, seed);
    return this;
  }

  /**
   * Draw an arc. angles are started from 3'clock in degree (0~360).
   */
  strokeArc(
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number,
    seed: number = 1
  ) {
    const sa = geometry.toRadian(startAngle);
    const ea = geometry.toRadian(endAngle);
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        // To avoid system stuck due to the bug of roughjs
        if (startAngle === 0 && endAngle === 360) return this;
        const rd = this.generator.arc(x, y, r * 2, r * 2, sa, ea, false, {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          disableMultiStroke: this.strokePattern.length > 1,
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "strokeArc",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          x,
          y,
          r,
          startAngle: sa,
          endAngle: ea,
        });
      }
    }
    return this;
  }

  /**
   * Draw filled arc. angles are started from 12'clock in degree.
   */
  fillArc(
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number,
    seed: number = 1
  ) {
    const sa = geometry.toRadian(geometry.normalizeAngle(startAngle));
    const ea = geometry.toRadian(geometry.normalizeAngle(endAngle));
    if (this.roughness > 0 || this.fillStyle !== FillStyle.SOLID) {
      const rd = this.generator.arc(x, y, r * 2, r * 2, sa, ea, true, {
        seed,
        roughness: this.roughness,
        fill: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        fillLineDash: [],
        hachureGap: Math.max(MIN_HACHURE_GAP, this.strokeWidth * 3),
        stroke: this.canvas.resolveColor("$transparent"),
        strokeWidth: this.strokeWidth,
      });
      this.do.push({ type: "rough", alpha: this.alpha, rd });
    } else {
      this.do.push({
        type: "fillArc",
        fillColor: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        alpha: this.alpha,
        x,
        y,
        r,
        startAngle: sa,
        endAngle: ea,
      });
    }
    return this;
  }

  /**
   * Draw an arc
   */
  arc(
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number,
    seed: number = 1
  ) {
    this.fillArc(x, y, r, startAngle, endAngle, seed);
    this.strokeArc(x, y, r, startAngle, endAngle, seed);
    return this;
  }

  /**
   * Draw a path
   */
  strokePath(path: SVGPath, seed: number = 1) {
    if (this.strokeWidth > 0) {
      if (this.roughness > 0) {
        const d = pathToString(path);
        const rd = this.generator.path(d, {
          seed,
          roughness: this.roughness,
          stroke: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          disableMultiStroke: this.strokePattern.length > 1,
          preserveVertices: true,
        });
        this.do.push({ type: "rough", alpha: this.alpha, rd });
      } else {
        this.do.push({
          type: "strokePath",
          strokeColor: this.canvas.resolveColor(this.strokeColor),
          strokeWidth: this.strokeWidth,
          strokeLineDash: this.strokePattern.map((v) => v * this.strokeWidth),
          alpha: this.alpha,
          path,
        });
      }
    }
    return this;
  }

  /**
   * Draw filled path
   */
  // NOTE: roughjs not work for fillStyle is "none" for path.
  fillPath(path: SVGPath, seed: number = 1) {
    if (
      this.roughness > 0 ||
      (this.fillStyle !== FillStyle.SOLID && this.fillStyle !== FillStyle.NONE)
    ) {
      const d = pathToString(path);
      const rd = this.generator.path(d, {
        seed,
        roughness: this.roughness,
        fill: this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        fillLineDash: [],
        hachureGap: Math.max(MIN_HACHURE_GAP, this.strokeWidth * 3),
        stroke: this.canvas.resolveColor("$transparent"),
        strokeWidth: this.strokeWidth,
        preserveVertices: true,
      });
      this.do.push({ type: "rough", alpha: this.alpha, rd });
    } else {
      this.do.push({
        type: "fillPath",
        fillColor:
          this.fillStyle === FillStyle.NONE
            ? this.canvas.resolveColor("$transparent")
            : this.canvas.resolveColor(this.fillColor),
        fillStyle: this.fillStyle,
        alpha: this.alpha,
        path,
      });
    }
    return this;
  }

  /**
   * Draw a path
   */
  path(path: SVGPath, seed: number = 1) {
    this.fillPath(path, seed);
    this.strokePath(path, seed);
    return this;
  }

  /**
   * Draw a freehand stroke
   *
   * @param path
   * @param thinning Thinning of the path
   * @param tailTaper Taper at the start of the path. value must be 0~1
   * @param headTaper Taper at the end of the path value must be 0~1
   */
  strokeFreehand(
    path: number[][],
    thinning: number = 0,
    tailTaper: number = 0,
    headTaper: number = 0
  ) {
    if (this.strokeWidth > 0) {
      const len = geometry.pathLength(path);
      const stroke = getStroke(path, {
        size: this.strokeWidth,
        thinning,
        start: tailTaper > 0 ? { taper: len * tailTaper } : undefined,
        end: headTaper > 0 ? { taper: len * headTaper } : undefined,
      });
      const pathData = getSvgPathFromStroke(stroke);
      const path2d = new Path2D(pathData);
      this.do.push({
        type: "strokeFreehand",
        strokeColor: this.canvas.resolveColor(this.strokeColor),
        alpha: this.alpha,
        path2d,
        pathData: pathData,
      });
    }
    return this;
  }

  /**
   * Fill a text
   * @param x
   * @param y text baseline (metric.ascent - not the top of text)
   * @param text
   */
  fillText(x: number, y: number, text: string) {
    this.do.push({
      type: "fillText",
      fontColor: this.canvas.resolveColor(this.fontColor),
      alpha: this.alpha,
      font: this.font,
      x,
      y,
      text,
    });
    return this;
  }

  /**
   * Draw Image
   */
  drawImage(
    image: HTMLImageElement,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number | number[]
  ) {
    const rs = Array.isArray(radius)
      ? radius
      : [radius, radius, radius, radius];
    this.do.push({
      type: "drawImage",
      alpha: this.alpha,
      image,
      x,
      y,
      w: width,
      h: height,
      radius: rs,
    });
    return this;
  }

  /**
   * Get Text Metric
   */
  textMetric(text: string): CanvasTextMetric {
    this.canvas.font = this.font;
    return this.canvas.textMetric(text);
  }

  /**
   * Draw memoized drawing objects
   */
  draw(canvas: Canvas) {
    for (const d of this.do) {
      canvas.context.lineCap = "round";
      canvas.context.lineJoin = "round";
      switch (d.type) {
        case "line": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          canvas.context.moveTo(d.x1, d.y1);
          canvas.context.lineTo(d.x2, d.y2);
          canvas.context.closePath();
          canvas.context.stroke();
          break;
        }
        case "strokeRect": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          canvas.context.rect(d.x, d.y, d.w, d.h);
          canvas.context.closePath();
          canvas.context.stroke();
          break;
        }
        case "fillRect": {
          canvas.context.fillStyle = d.fillColor;
          canvas.context.globalAlpha = d.alpha;
          canvas.context.fillRect(d.x, d.y, d.w, d.h);
          break;
        }
        case "strokeRoundRect": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          canvas.context.moveTo(d.x + d.radius[0], d.y);
          canvas.context.lineTo(d.x + d.w - d.radius[1], d.y);
          canvas.context.arcTo(
            d.x + d.w,
            d.y,
            d.x + d.w,
            d.y + d.radius[1],
            d.radius[1]
          );
          canvas.context.lineTo(d.x + d.w, d.y + d.h - d.radius[2]);
          canvas.context.arcTo(
            d.x + d.w,
            d.y + d.h,
            d.x + d.w - d.radius[2],
            d.y + d.h,
            d.radius[2]
          );
          canvas.context.lineTo(d.x + d.radius[3], d.y + d.h);
          canvas.context.arcTo(
            d.x,
            d.y + d.h,
            d.x,
            d.y + d.h - d.radius[3],
            d.radius[3]
          );
          canvas.context.lineTo(d.x, d.y + d.radius[0]);
          canvas.context.arcTo(d.x, d.y, d.x + d.radius[0], d.y, d.radius[0]);
          canvas.context.closePath();
          canvas.context.stroke();
          break;
        }
        case "fillRoundRect": {
          canvas.context.fillStyle = d.fillColor;
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          canvas.context.moveTo(d.x + d.radius[0], d.y);
          canvas.context.lineTo(d.x + d.w - d.radius[1], d.y);
          canvas.context.arcTo(
            d.x + d.w,
            d.y,
            d.x + d.w,
            d.y + d.radius[1],
            d.radius[1]
          );
          canvas.context.lineTo(d.x + d.w, d.y + d.h - d.radius[2]);
          canvas.context.arcTo(
            d.x + d.w,
            d.y + d.h,
            d.x + d.w - d.radius[2],
            d.y + d.h,
            d.radius[2]
          );
          canvas.context.lineTo(d.x + d.radius[3], d.y + d.h);
          canvas.context.arcTo(
            d.x,
            d.y + d.h,
            d.x,
            d.y + d.h - d.radius[3],
            d.radius[3]
          );
          canvas.context.lineTo(d.x, d.y + d.radius[0]);
          canvas.context.arcTo(d.x, d.y, d.x + d.radius[0], d.y, d.radius[0]);
          canvas.context.closePath();
          canvas.context.fill();
          break;
        }
        case "strokeEllipse": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          const kappa = 0.5522848;
          const ox = (d.w / 2.0) * kappa;
          const oy = (d.h / 2.0) * kappa;
          const xe = d.x + d.w;
          const ye = d.y + d.h;
          const xm = d.x + d.w / 2.0;
          const ym = d.y + d.h / 2.0;
          canvas.context.beginPath();
          canvas.context.moveTo(d.x, ym);
          canvas.context.bezierCurveTo(d.x, ym - oy, xm - ox, d.y, xm, d.y);
          canvas.context.bezierCurveTo(xm + ox, d.y, xe, ym - oy, xe, ym);
          canvas.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
          canvas.context.bezierCurveTo(xm - ox, ye, d.x, ym + oy, d.x, ym);
          canvas.context.closePath();
          canvas.context.stroke();
          break;
        }
        case "fillEllipse": {
          canvas.context.fillStyle = d.fillColor;
          canvas.context.globalAlpha = d.alpha;
          const kappa = 0.5522848;
          const ox = (d.w / 2.0) * kappa;
          const oy = (d.h / 2.0) * kappa;
          const xe = d.x + d.w;
          const ye = d.y + d.h;
          const xm = d.x + d.w / 2.0;
          const ym = d.y + d.h / 2.0;
          canvas.context.beginPath();
          canvas.context.moveTo(d.x, ym);
          canvas.context.bezierCurveTo(d.x, ym - oy, xm - ox, d.y, xm, d.y);
          canvas.context.bezierCurveTo(xm + ox, d.y, xe, ym - oy, xe, ym);
          canvas.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
          canvas.context.bezierCurveTo(xm - ox, ye, d.x, ym + oy, d.x, ym);
          canvas.context.closePath();
          canvas.context.fill();
          break;
        }
        case "polyline": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          for (let i = 0, len = d.path.length; i < len; i++) {
            const p = d.path[i];
            if (i === 0) {
              canvas.context.moveTo(p[0], p[1]);
            } else {
              canvas.context.lineTo(p[0], p[1]);
            }
          }
          canvas.context.stroke();
          break;
        }
        case "strokeCurve": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          if (d.path.length > 2) {
            const ps = geometry.curvePathPoints(d.path);
            this.polyline(ps);
          } else {
            canvas.context.moveTo(d.path[0][0], d.path[0][1]);
            canvas.context.lineTo(
              d.path[d.path.length - 1][0],
              d.path[d.path.length - 1][1]
            );
          }
          canvas.context.stroke();
          break;
        }
        case "fillCurve": {
          canvas.context.fillStyle = d.fillColor;
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          if (d.path.length > 2) {
            const ps = geometry.curvePathPoints([...d.path, d.path[0]]);
            for (let i = 0, len = ps.length; i < len; i++) {
              const p = ps[i];
              if (i === 0) {
                canvas.context.moveTo(p[0], p[1]);
              } else {
                canvas.context.lineTo(p[0], p[1]);
              }
            }
          } else {
            canvas.context.moveTo(d.path[0][0], d.path[0][1]);
            canvas.context.lineTo(
              d.path[d.path.length - 1][0],
              d.path[d.path.length - 1][1]
            );
          }
          canvas.context.fill();
          break;
        }
        case "strokePolygon": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          let start: number[] = [-1, -1];
          for (let i = 0, len = d.path.length; i < len; i++) {
            const p = d.path[i];
            if (i === 0) {
              start = p;
              canvas.context.moveTo(p[0], p[1]);
            } else {
              canvas.context.lineTo(p[0], p[1]);
            }
          }
          canvas.context.lineTo(start[0], start[1]);
          canvas.context.stroke();
          break;
        }
        case "fillPolygon": {
          canvas.context.fillStyle = d.fillColor;
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          for (let i = 0, len = d.path.length; i < len; i++) {
            const p = d.path[i];
            if (i === 0) {
              canvas.context.moveTo(p[0], p[1]);
            } else {
              canvas.context.lineTo(p[0], p[1]);
            }
          }
          canvas.context.fill();
          break;
        }
        case "strokeArc": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          canvas.context.arc(d.x, d.y, d.r, d.startAngle, d.endAngle, false);
          canvas.context.stroke();
          break;
        }
        case "fillArc": {
          canvas.context.fillStyle = d.fillColor;
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          canvas.context.arc(d.x, d.y, d.r, d.startAngle, d.endAngle, false);
          canvas.context.fill();
          break;
        }
        case "strokePath": {
          canvas.context.strokeStyle = d.strokeColor;
          canvas.context.lineWidth = d.strokeWidth;
          canvas.context.setLineDash(d.strokeLineDash);
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          const pathData = pathToString(d.path);
          const path2d = new Path2D(pathData);
          // inject pathData into path2d so that pseudo Context2D can draw it
          (path2d as any).pathData = pathData;
          canvas.context.stroke(path2d);
          break;
        }
        case "fillPath": {
          canvas.context.fillStyle = d.fillColor;
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          const pathData = pathToString(d.path);
          const path2d = new Path2D(pathData);
          // inject pathData into path2d so that pseudo Context2D can draw it
          (path2d as any).pathData = pathData;
          canvas.context.fill(path2d);
          break;
        }
        case "strokeFreehand": {
          canvas.context.fillStyle = d.strokeColor;
          canvas.context.lineCap = "round";
          canvas.context.globalAlpha = d.alpha;
          canvas.context.beginPath();
          // inject pathData into path2d so that pseudo Context2D can draw it
          (d.path2d as any).pathData = d.pathData;
          canvas.context.fill(d.path2d);
          break;
        }
        case "fillText": {
          canvas.context.fillStyle = d.fontColor;
          canvas.context.globalAlpha = d.alpha;
          canvas.context.font = d.font;
          canvas.context.beginPath();
          canvas.context.fillText(d.text, d.x, d.y);
          break;
        }
        case "drawImage": {
          canvas.context.globalAlpha = d.alpha;
          if (d.image && d.image.complete) {
            canvas.context.strokeStyle = this.canvas.resolveColor(
              Color.TRANSPARENT
            );
            canvas.context.lineWidth = 0;
            canvas.context.setLineDash([]);
            canvas.context.globalAlpha = d.alpha;
            canvas.context.fillStyle = this.canvas.resolveColor(
              Color.TRANSPARENT
            );
            canvas.context.beginPath();
            canvas.context.moveTo(d.x + d.radius[0], d.y);
            canvas.context.lineTo(d.x + d.w - d.radius[1], d.y);
            canvas.context.arcTo(
              d.x + d.w,
              d.y,
              d.x + d.w,
              d.y + d.radius[1],
              d.radius[1]
            );
            canvas.context.lineTo(d.x + d.w, d.y + d.h - d.radius[2]);
            canvas.context.arcTo(
              d.x + d.w,
              d.y + d.h,
              d.x + d.w - d.radius[2],
              d.y + d.h,
              d.radius[2]
            );
            canvas.context.lineTo(d.x + d.radius[3], d.y + d.h);
            canvas.context.arcTo(
              d.x,
              d.y + d.h,
              d.x,
              d.y + d.h - d.radius[3],
              d.radius[3]
            );
            canvas.context.lineTo(d.x, d.y + d.radius[0]);
            canvas.context.arcTo(d.x, d.y, d.x + d.radius[0], d.y, d.radius[0]);
            canvas.context.closePath();
            canvas.context.fill();
            canvas.context.clip();
            canvas.context.drawImage(d.image, d.x, d.y, d.w, d.h);
          }
          break;
        }
        case "rough": {
          canvas.context.globalAlpha = d.alpha;
          roughDraw(canvas.context, d.rd);
          break;
        }
      }
    }
  }
}

export { MemoizationCanvas };
