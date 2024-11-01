import type { CanvasPointerEvent } from "../graphics/graphics";
import { Shape, Line, Movable, Connector, Page, Path } from "../shapes";
import { Controller, Editor, Manipulator, manipulatorManager } from "../editor";
import * as geometry from "../graphics/geometry";
import { Cursor } from "../graphics/const";
import { changeParent, resolveAllConstraints, setPath } from "../macro";
import { ActionKind } from "../core";
import { ableToContain } from "./utils";
import { GridSnapper, MoveSnapper } from "../manipulators/snapper";
import { getAllDescendant } from "../utils/shape-utils";

/**
 * ConnectorMove Controller
 */
export class ConnectorMoveController extends Controller {
  /**
   * Grid snapper
   */
  gridSnapper: GridSnapper;

  /**
   * Move snapper
   */
  moveSnapper: MoveSnapper;

  /**
   * Ghost polygon
   */
  controlPath: number[][];

  /**
   * Reference to a container shape
   */
  container: Shape | null;

  constructor(manipulator: Manipulator) {
    super(manipulator);
    this.hasHandle = false;
    this.gridSnapper = new GridSnapper();
    this.moveSnapper = new MoveSnapper();
    this.controlPath = [];
    this.container = null;
  }

  /**
   * Indicates the controller is active or not
   */
  active(editor: Editor, shape: Shape): boolean {
    return (
      editor.selection.size() === 1 &&
      editor.selection.isSelected(shape) &&
      shape.movable !== Movable.NONE &&
      shape instanceof Connector
    );
  }

  /**
   * Returns mouse cursor for the controller
   * @returns cursor [type, angle]
   */
  mouseCursor(
    editor: Editor,
    shape: Shape,
    e: CanvasPointerEvent
  ): [string, number] {
    return [Cursor.MOVE, 0];
  }

  initialize(editor: Editor, shape: Shape): void {
    // initialize snappers
    this.gridSnapper.setPointToSnap(editor, this, [shape.left, shape.top]);
    this.moveSnapper.setRectToSnap(editor, shape, shape.getBoundingRect());
    this.moveSnapper.setReferencePoints(editor, getAllDescendant([shape]));

    this.controlPath = geometry.pathCopy((shape as Path).path);
    editor.transform.startAction(ActionKind.REPATH);
  }

  /**
   * Update ghost
   */
  update(editor: Editor, shape: Shape) {
    // snap dragging points
    this.gridSnapper.snap(editor, shape, this);
    this.moveSnapper.snap(editor, shape, this);

    // apply movable property
    let targetShape: Shape | null = shape;
    if (targetShape.movable === Movable.PARENT)
      targetShape = targetShape.findParent(
        (s) => (s as Shape).movable !== Movable.PARENT
      ) as Shape;
    if (!targetShape || targetShape instanceof Page) return;
    if (
      targetShape.movable === Movable.VERT ||
      targetShape.movable === Movable.NONE
    )
      this.dx = 0;
    if (
      targetShape.movable === Movable.HORZ ||
      targetShape.movable === Movable.NONE
    )
      this.dy = 0;

    // determine container
    const canvas = editor.canvas;
    let p2 = targetShape.localCoordTransform(canvas, this.dragPoint, false);
    this.container =
      editor.getCurrentPage()?.getShapeAt(canvas, p2, [shape]) ?? null;
    if (this.container && !ableToContain(this.container, targetShape)) {
      this.container = null;
    }
    if (!this.container) this.container = editor.getCurrentPage();

    // update ghost
    let newPath = this.controlPath.map((p) => [p[0] + this.dx, p[1] + this.dy]);

    // transform shape
    const page = editor.getCurrentPage()!;
    editor.transform.transact((tx) => {
      if (this.dx !== 0 || this.dy !== 0) {
        setPath(tx, shape as Line, newPath);
        tx.assignRef(shape, "head", null);
        tx.assignRef(shape, "tail", null);
        if (this.container && shape.parent !== this.container) {
          changeParent(tx, shape, this.container);
        }
        resolveAllConstraints(tx, page, canvas);
      }
    });
  }

  /**
   * Finalize shape by ghost
   */
  finalize(editor: Editor, shape: Shape) {
    editor.transform.endAction();
  }

  /**
   * Draw controller
   */
  drawDragging(editor: Editor, shape: Shape, e: CanvasPointerEvent) {
    super.drawDragging(editor, shape, e);
    if (this.container) {
      const manipulator = manipulatorManager.get(this.container.type);
      if (manipulator) manipulator.drawHovering(editor, this.container, e);
    }

    // draw snapping
    this.moveSnapper.draw(editor);
  }
}
