---
editUrl: false
next: false
prev: false
title: "TextFactoryHandler"
---

Text Factory Handler

## Extends

- [`Handler`](/api-core/classes/handler/)

## Constructors

### new TextFactoryHandler()

> **new TextFactoryHandler**(`id`, `options`?): [`TextFactoryHandler`](/api-core/namespaces/handlers/classes/textfactoryhandler/)

#### Parameters

• **id**: `string`

• **options?**: `Partial`\<[`HandlerOptions`](/api-core/interfaces/handleroptions/)\>

#### Returns

[`TextFactoryHandler`](/api-core/namespaces/handlers/classes/textfactoryhandler/)

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`constructor`](/api-core/classes/handler/#constructors)

#### Source

[editor.ts:1456](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1456)

## Properties

### dragPoint

> **dragPoint**: `number`[]

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`dragPoint`](/api-core/classes/handler/#dragpoint)

#### Source

[editor.ts:1454](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1454)

***

### dragStartPoint

> **dragStartPoint**: `number`[]

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`dragStartPoint`](/api-core/classes/handler/#dragstartpoint)

#### Source

[editor.ts:1453](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1453)

***

### dragging

> **dragging**: `boolean`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`dragging`](/api-core/classes/handler/#dragging)

#### Source

[editor.ts:1452](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1452)

***

### id

> **id**: `string`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`id`](/api-core/classes/handler/#id)

#### Source

[editor.ts:1450](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1450)

***

### options

> **options**: [`HandlerOptions`](/api-core/interfaces/handleroptions/)

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`options`](/api-core/classes/handler/#options)

#### Source

[editor.ts:1451](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1451)

***

### shape

> **shape**: `null` \| [`Text`](/api-core/classes/text/) = `null`

#### Source

[handlers/text-handler.ts:12](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L12)

***

### snapper

> **snapper**: `HandlerSnapper`

#### Source

[handlers/text-handler.ts:13](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L13)

## Methods

### activate()

> **activate**(`editor`): `void`

Activate the handler

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`activate`](/api-core/classes/handler/#activate)

#### Source

[editor.ts:1489](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1489)

***

### complete()

> **complete**(`editor`): `void`

Trigger when the handler action is complete

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`complete`](/api-core/classes/handler/#complete)

#### Source

[editor.ts:1480](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1480)

***

### deactivate()

> **deactivate**(`editor`): `void`

Deactivate the handler

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`deactivate`](/api-core/classes/handler/#deactivate)

#### Source

[editor.ts:1497](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1497)

***

### drawDragging()

> **drawDragging**(`editor`, `e`): `void`

Draw dragging

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`drawDragging`](/api-core/classes/handler/#drawdragging)

#### Source

[handlers/text-handler.ts:82](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L82)

***

### drawHovering()

> **drawHovering**(`editor`, `e`): `void`

Draw hovering

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`drawHovering`](/api-core/classes/handler/#drawhovering)

#### Source

[handlers/text-handler.ts:78](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L78)

***

### drawSelection()

> **drawSelection**(`editor`): `void`

Draw ghost for the selected shape

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`drawSelection`](/api-core/classes/handler/#drawselection)

#### Source

[editor.ts:1603](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1603)

***

### finalize()

> **finalize**(`editor`, `e`): `void`

Finalize handler

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`finalize`](/api-core/classes/handler/#finalize)

#### Source

[editor.ts:1534](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1534)

***

### initialize()

> **initialize**(`editor`, `e`): `void`

Initialize handler

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`initialize`](/api-core/classes/handler/#initialize)

#### Source

[handlers/text-handler.ts:20](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L20)

***

### keyDown()

> **keyDown**(`editor`, `e`): `boolean`

keyDown

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: `KeyboardEvent`

#### Returns

`boolean`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`keyDown`](/api-core/classes/handler/#keydown)

#### Source

[editor.ts:1585](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1585)

***

### keyUp()

> **keyUp**(`editor`, `e`): `void`

keyUp

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: `KeyboardEvent`

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`keyUp`](/api-core/classes/handler/#keyup)

#### Source

[editor.ts:1598](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1598)

***

### onActionPerformed()

> **onActionPerformed**(`editor`): `void`

Triggered when action is performed (unclude undo and redo)

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`onActionPerformed`](/api-core/classes/handler/#onactionperformed)

#### Source

[handlers/text-handler.ts:74](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L74)

***

### onActivate()

> **onActivate**(`editor`): `void`

Triggered when activated

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`onActivate`](/api-core/classes/handler/#onactivate)

#### Source

[handlers/text-handler.ts:65](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L65)

***

### onDeactivate()

> **onDeactivate**(`editor`): `void`

Triggered when deactivate

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`onDeactivate`](/api-core/classes/handler/#ondeactivate)

#### Source

[handlers/text-handler.ts:70](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L70)

***

### pointerDown()

> **pointerDown**(`editor`, `e`): `void`

pointerDown

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`pointerDown`](/api-core/classes/handler/#pointerdown)

#### Source

[editor.ts:1539](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1539)

***

### pointerMove()

> **pointerMove**(`editor`, `e`): `void`

pointerMove

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`pointerMove`](/api-core/classes/handler/#pointermove)

#### Abstract

#### Source

[editor.ts:1568](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1568)

***

### pointerUp()

> **pointerUp**(`editor`, `e`): `void`

pointerUp

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Inherited from

[`Handler`](/api-core/classes/handler/).[`pointerUp`](/api-core/classes/handler/#pointerup)

#### Abstract

#### Source

[editor.ts:1555](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/editor.ts#L1555)

***

### reset()

> **reset**(): `void`

Reset the states of handler

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`reset`](/api-core/classes/handler/#reset)

#### Source

[handlers/text-handler.ts:15](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L15)

***

### update()

> **update**(`editor`, `e`): `void`

Update handler

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`update`](/api-core/classes/handler/#update)

#### Source

[handlers/text-handler.ts:44](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L44)

***

### updateHovering()

> **updateHovering**(`editor`, `e`): `void`

Update handler when hovering (not dragging)

#### Parameters

• **editor**: [`Editor`](/api-core/classes/editor/)

• **e**: [`CanvasPointerEvent`](/api-core/classes/canvaspointerevent/)

#### Returns

`void`

#### Overrides

[`Handler`](/api-core/classes/handler/).[`updateHovering`](/api-core/classes/handler/#updatehovering)

#### Source

[handlers/text-handler.ts:59](https://github.com/dgmjs/dgmjs/blob/main/packages/core/src/handlers/text-handler.ts#L59)
