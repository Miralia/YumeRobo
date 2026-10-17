import test from "node:test";
import assert from "node:assert/strict";

import { boundaryIndicator } from "./overscroll.ts";

type Listener = (event: unknown) => void;

class FakeElement {
    readonly style: Record<string, string> = {};
    removed = false;

    remove() {
        this.removed = true;
    }
}

class FakeDocument {
    readonly documentElement = { scrollHeight: 2000 };
    readonly appended: FakeElement[] = [];
    readonly body = {
        appendChild: (element: FakeElement) => {
            this.appended.push(element);
        },
    };
    observed: unknown = null;

    createElement() {
        return new FakeElement();
    }
}

class FakeWindow {
    readonly listeners = new Map<string, Set<Listener>>();
    innerHeight = 800;
    scrollY = 0;

    addEventListener(type: string, listener: Listener) {
        const set = this.listeners.get(type) ?? new Set<Listener>();
        set.add(listener);
        this.listeners.set(type, set);
    }

    removeEventListener(type: string, listener: Listener) {
        this.listeners.get(type)?.delete(listener);
    }

    dispatch(type: string, event: unknown = {}) {
        for (const listener of [...(this.listeners.get(type) ?? [])]) {
            listener(event);
        }
    }

    listenerCount(type: string) {
        return this.listeners.get(type)?.size ?? 0;
    }

    matchMedia(query: string): MediaQueryList {
        return {
            media: query,
            matches: false,
            addEventListener() {},
            removeEventListener() {},
        } as unknown as MediaQueryList;
    }

    setTimeout(handler: () => void, timeout?: number) {
        return globalThis.setTimeout(handler, timeout);
    }

    clearTimeout(id: number) {
        globalThis.clearTimeout(id);
    }
}

function installDom() {
    const fakeWindow = new FakeWindow();
    const fakeDocument = new FakeDocument();

    class FakeResizeObserver {
        constructor(private readonly callback: () => void) {
            void this.callback;
        }
        observe(target: unknown) {
            fakeDocument.observed = target;
        }
        disconnect() {}
        unobserve() {}
    }

    const globals = globalThis as unknown as Record<string, unknown>;
    globals.window = fakeWindow;
    globals.document = fakeDocument;
    globals.ResizeObserver = FakeResizeObserver;

    return { fakeWindow, fakeDocument };
}

function fakeNode() {
    return {} as unknown as HTMLElement;
}

test("a page shorter than the viewport never flashes a glow", () => {
    const { fakeWindow, fakeDocument } = installDom();
    fakeDocument.documentElement.scrollHeight = 500;

    const action = boundaryIndicator(fakeNode());
    fakeWindow.dispatch("wheel", { deltaY: -120 });

    assert.equal(fakeDocument.appended.length, 0);

    action.destroy();
});

test("a scrollable page shows the top glow on an upward wheel", () => {
    const { fakeWindow, fakeDocument } = installDom();

    const action = boundaryIndicator(fakeNode());
    fakeWindow.dispatch("wheel", { deltaY: -120 });

    assert.equal(fakeDocument.appended.length, 1);

    action.destroy();
    assert.equal(fakeDocument.appended[0].removed, true);
});

test("the same node is never initialised twice", () => {
    const { fakeWindow, fakeDocument } = installDom();
    const node = fakeNode();

    const first = boundaryIndicator(node);
    const second = boundaryIndicator(node);

    assert.equal(fakeWindow.listenerCount("wheel"), 1);
    fakeWindow.dispatch("wheel", { deltaY: -120 });
    assert.equal(fakeDocument.appended.length, 1);

    void first;
    second.destroy();
});

test("the resize observer watches the document element", () => {
    const { fakeDocument } = installDom();

    const action = boundaryIndicator(fakeNode());

    assert.equal(fakeDocument.observed, fakeDocument.documentElement);

    action.destroy();
});
