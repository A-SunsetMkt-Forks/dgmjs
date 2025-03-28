import { Editor, Page, Shape, ShapeProps } from "@dgmjs/core";
import {
  YjsDocSyncPlugin,
  YjsUserPresencePlugin,
} from "@dgmjs/dgmjs-plugin-yjs";
import { nanoid } from "nanoid";
import { PaletteToolbar } from "./components/palette-toolbar";
import { useDemoStore } from "./demo-store";
import { Options } from "./components/options";
import { Menus } from "./components/menus";
import { PropertySidebar } from "./components/property-sidebar";
import fontJson from "./fonts.json";
import { Font, fetchFonts, insertFontsToDocument } from "./font-manager";
import { ShapeSidebar } from "./components/shape-sidebar";
import { EditorWrapper } from "./editor";
import { Button } from "./components/ui/button";
import { collab, generateUserIdentity } from "./collab";
import { SelectShapeDialog } from "./components/dialogs/select-shape-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./components/ui/context-menu";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    editor: Editor;
  }
}

function App() {
  const demoStore = useDemoStore();
  const [isTextFocused, setIsTextFocused] = useState(false);

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  const roomId = params.roomId;

  useEffect(() => {
    const focusinHandler = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        setIsTextFocused(true);
      } else {
        setIsTextFocused(false);
      }
    };
    document.addEventListener("focusin", focusinHandler);
    return () => {
      document.removeEventListener("focusin", focusinHandler);
    };
  }, []);

  const handleMount = async (editor: Editor) => {
    window.editor = editor;
    insertFontsToDocument(fontJson as Font[]);
    await fetchFonts(fontJson as Font[]);

    if (roomId) {
      collab.start(window.editor, roomId, generateUserIdentity());
      console.log("collab started with roomId", roomId);
    } else {
      window.editor.newDoc();
    }

    window.editor.transform.onTransaction.addListener(() => {
      // console.log("tx", tx);
    });
    window.editor.transform.onAction.addListener(() => {
      // console.log("action", action);
    });

    // window.editor.factory.onShapeInitialize.addListener((shape: Shape) => {
    //   shape.strokeWidth = 2;
    //   shape.roughness = 1;
    //   shape.fillColor = "$lime9";
    //   shape.fillStyle = FillStyle.HACHURE;
    // });

    // load from local storage
    const localData = localStorage.getItem("local-data");
    if (localData) {
      window.editor.loadFromJSON(JSON.parse(localData));
    }
    demoStore.setDoc(window.editor.getDoc());
    demoStore.setCurrentPage(window.editor.getCurrentPage());
    // window.editor.fitToScreen();

    window.addEventListener("resize", () => {
      window.editor.fit();
    });

    collab.oDocReady.addListener(() => {
      const doc = window.editor.getDoc();
      if (doc) {
        demoStore.setDoc(doc);
        demoStore.setCurrentPage(window.editor.getCurrentPage());
      }
    });

    // forward key event to editor
    // window.addEventListener("keydown", (e) => {
    //   const event = new KeyboardEvent("keydown", { ...e });
    //   editor.canvasElement.dispatchEvent(event);
    // });
  };

  const handleShapeCreate = (shape: Shape) => {
    if (!window.editor.getActiveHandlerLock()) {
      setTimeout(() => {
        window.editor.selection.select([shape]);
        window.editor.repaint();
      }, 0);
    }
  };

  const handleSelectionChange = (selection: Shape[]) => {
    demoStore.setSelection([...selection]);
  };

  const handleActiveHandlerChange = (handlerId: string) => {
    demoStore.setActiveHandler(handlerId);
    window.editor?.selection.deselectAll();
    window.editor?.focus();
  };

  const handleAction = () => {
    const data = window.editor.store.toJSON();
    localStorage.setItem("local-data", JSON.stringify(data));
  };

  const handleSidebarSelect = (selection: Shape[]) => {
    window.editor.selection.select(selection);
  };

  const handleValuesChange = (values: ShapeProps) => {
    const shapes = window.editor.selection.getShapes();
    window.editor.actions.update(values);
    demoStore.setSelection([...shapes]);
  };

  const handlePageChange = (pageProps: Partial<Page>) => {
    const currentPage = window.editor.getCurrentPage();
    window.editor.actions.update(pageProps, [currentPage!]);
    demoStore.setCurrentPage(currentPage);
  };

  const handleCurrentPageChange = (page: Page) => {
    demoStore.setCurrentPage(page);
  };

  const handleShare = () => {
    const roomId = nanoid();
    collab.start(window.editor, roomId!, generateUserIdentity());
    collab.flush();
    window.history.pushState({}, "", `?roomId=${roomId}`);
  };

  const handleShareStop = () => {
    collab.stop();
    window.history.pushState({}, "", "/");
  };

  return (
    <div className="absolute inset-0 h-[calc(100dvh)] select-none">
      <ContextMenu>
        <ContextMenuTrigger disabled={isTextFocused}>
          <EditorWrapper
            className="absolute inset-y-0 left-56 right-56"
            darkMode={demoStore.darkMode}
            options={{
              showDOM: true,
              keymapEventTarget: window,
              imageResize: {
                quality: 1,
                maxWidth: 2800,
                maxHeight: 2800,
              },
            }}
            plugins={[new YjsDocSyncPlugin(), new YjsUserPresencePlugin()]}
            showGrid={demoStore.showGrid}
            onMount={handleMount}
            onShapeCreate={handleShapeCreate}
            onSelectionChange={handleSelectionChange}
            onCurrentPageChange={handleCurrentPageChange}
            onActiveHandlerChange={handleActiveHandlerChange}
            onActiveHandlerLockChange={(lock) =>
              demoStore.setActiveHandlerLock(lock)
            }
            onAction={handleAction}
          />
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>Context Menu 1</ContextMenuItem>
          <ContextMenuItem>Context Menu 2</ContextMenuItem>
          <ContextMenuItem>Context Menu 3</ContextMenuItem>
          <ContextMenuItem>Context Menu 4</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      <div className="absolute top-2 left-60 right-60 h-10 border flex items-center justify-between bg-background">
        <Menus />
        <Options />
        <Button size="sm" onClick={handleShare}>
          Share
        </Button>
        <Button size="sm" onClick={handleShareStop}>
          Stop
        </Button>
      </div>
      <PaletteToolbar />
      <ShapeSidebar
        doc={demoStore.doc!}
        currentPage={demoStore.currentPage}
        onSelect={handleSidebarSelect}
        onPageSelect={(page) => {
          window.editor.setCurrentPage(page);
        }}
      />
      <PropertySidebar
        doc={demoStore.doc!}
        currentPage={demoStore.currentPage!}
        shapes={demoStore.selection}
        onChange={handleValuesChange}
        onPageChange={handlePageChange}
      />
      <SelectShapeDialog />
    </div>
  );
}

export default App;
