import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Movable,
  Sizable,
  Box,
  MovableEnum,
  SizableEnum,
  Path,
} from "@dgmjs/core";
import React from "react";
import { Panel } from "../common/panel";
import { Label } from "@/components/ui/label";
import { TextField } from "./fields/text-field";
import { ShapeEditorProps } from "@/types";
import { merge } from "@/utils";
import { cn } from "@/lib/utils";

export const ControlPanel: React.FC<ShapeEditorProps> = ({
  shapes,
  onChange,
}) => {
  const isBox = shapes.every((s) => s instanceof Box);
  const isPath = shapes.every((s) => s instanceof Path);

  const enabled = merge(shapes.map((s) => s.enable));
  const visible = merge(shapes.map((s) => s.visible));
  const containable = merge(shapes.map((s) => s.containable));
  const containableFilter = merge(shapes.map((s) => s.containableFilter));
  const movableParentFilter = merge(shapes.map((s) => s.movableParentFilter));
  const connectable = merge(shapes.map((s) => s.connectable));
  const rotatable = merge(shapes.map((s) => s.rotatable));
  const sizable = merge(shapes.map((s) => s.sizable));
  const movable = merge(shapes.map((s) => s.movable));
  const textEditable = merge(
    shapes.map((s) => (s instanceof Box ? s.textEditable : false))
  );
  const pathEditable = merge(
    shapes.map((s) => (s instanceof Path ? s.pathEditable : false))
  );
  const anchored = merge(
    shapes.map((s) => (s instanceof Box ? s.anchored : false))
  );

  return (
    <Panel title="Control" borderTop>
      <div className="grid h-7 grid-cols-2 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-enabled-checkbox"
            checked={enabled}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") onChange({ enable: checked });
            }}
          />
          <Label
            className="font-normal text-xs"
            htmlFor="shape-enabled-checkbox"
          >
            Enable
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-visible-checkbox"
            checked={visible}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") onChange({ visible: checked });
            }}
          />
          <Label
            className="font-normal text-xs"
            htmlFor="shape-visible-checkbox"
          >
            Visible
          </Label>
        </div>
      </div>
      <div className="grid h-7 grid-cols-2 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-connectable-checkbox"
            checked={connectable}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean")
                onChange({ connectable: checked });
            }}
          />
          <Label
            className="font-normal text-xs"
            htmlFor="shape-connectable-checkbox"
          >
            Connectable
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-containable-checkbox"
            checked={containable}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean")
                onChange({ containable: checked });
            }}
          />
          <Label
            className="font-normal text-xs"
            htmlFor="shape-containable-checkbox"
          >
            Containable
          </Label>
        </div>
      </div>
      <div className="grid h-7 grid-cols-2 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-rotatable-checkbox"
            checked={rotatable}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean")
                onChange({ rotatable: checked });
            }}
          />
          <Label
            className="font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs"
            htmlFor="shape-rotatable-checkbox"
          >
            Rotatable
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-anchored-checkbox"
            checked={anchored}
            disabled={!isBox}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean") onChange({ anchored: checked });
            }}
          />
          <Label
            className="font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs"
            htmlFor="shape-anchored-checkbox"
          >
            Anchored
          </Label>
        </div>
      </div>
      <div className="grid h-7 grid-cols-2 items-center">
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-text-editable-checkbox"
            checked={textEditable}
            disabled={!isBox}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean")
                onChange({ textEditable: checked });
            }}
          />
          <Label
            className="font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs"
            htmlFor="shape-text-editable-checkbox"
          >
            Text Editable
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="shape-path-editable-checkbox"
            checked={pathEditable}
            disabled={!isPath}
            onCheckedChange={(checked) => {
              if (typeof checked === "boolean")
                onChange({ pathEditable: checked });
            }}
          />
          <Label
            className="font-normal peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-xs"
            htmlFor="shape-path-editable-checkbox"
          >
            Path Editable
          </Label>
        </div>
      </div>
      {isBox && (
        <div className="grid h-7 grid-cols-2 items-center">
          <Label htmlFor="shape-sizable-select" className="font-normal text-xs">
            Sizable
          </Label>
          <Select
            value={sizable}
            onValueChange={(value) =>
              onChange({ sizable: value as SizableEnum })
            }
          >
            <SelectTrigger id="shape-sizable-select" className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(Sizable).map((entry) => (
                <SelectItem key={entry[0]} value={entry[1]} className="text-xs">
                  {entry[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="grid h-7 grid-cols-2 items-center">
        <Label htmlFor="shape-movable-select" className="font-normal text-xs">
          Movable
        </Label>
        <Select
          value={movable}
          onValueChange={(value) => onChange({ movable: value as MovableEnum })}
        >
          <SelectTrigger id="shape-movable-select" className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(Movable).map((entry) => (
              <SelectItem className="text-xs" key={entry[0]} value={entry[1]}>
                {entry[0]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col items-start">
        <Label
          htmlFor="shape-movable-parent-filter-field"
          className={cn(
            "font-normal text-xs h-7 flex items-center",
            movable !== Movable.PARENT && "opacity-50"
          )}
        >
          Movable parent filter
        </Label>
        <TextField
          id="shape-movable-parent-filter-field"
          className="h-7 text-xs"
          value={movableParentFilter}
          disabled={movable !== Movable.PARENT}
          onChange={(value) => {
            onChange({ movableParentFilter: value });
          }}
        />
      </div>
      <div className="flex flex-col items-start">
        <Label
          htmlFor="shape-containable-filter-field"
          className={cn(
            "font-normal text-xs h-7 flex items-center",
            !containable && "opacity-50"
          )}
        >
          Containable Filter
        </Label>
        <TextField
          id="shape-containable-filter-field"
          className="h-7 text-xs"
          value={containableFilter}
          disabled={!containable}
          onChange={(value) => {
            onChange({ containableFilter: value });
          }}
        />
      </div>
    </Panel>
  );
};
