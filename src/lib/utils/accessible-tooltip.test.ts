import test from "node:test";
import assert from "node:assert/strict";

import { accessibleTooltip } from "./accessible-tooltip.ts";

type Listener = (event: unknown) => void;

function rect(left: number, top: number, width: number, height: number): DOMRect {
    return {
        x: left,
        y: top,
        width,
        height,
        top,
        right: left + width,
        bottom: top + height,
        left,
        toJSON: () => ({}),
    } as DOMRect;
}

class FakeElement {
    id = "";
    className = "";
    textContent = "";
    readonly style: Record<string, string> = {};
    readonly dataset: Record<string, string> = {};
    removed = false;
    readonly attributes = new Map<string, string>();

    setAttribute(name: string, value: string) {
        this.attributes.set(name, value);
    }

    getAttribute(name: string) {
        return this.attributes.get(name) ?? null;
    }

    removeAttribute(name: string) {
        this.attributes.delete(name);
    }

    remove() {
        this.removed = true;
    }

    getBoundingClientRect() {
        return rect(100, 60, 80, 20);
    }
}

class FakeNode extends FakeElement {
    readonly listeners = new Map<string, Set<Listener>>();
    rectReads = 0;
    focusVisible = false;

    addEventListener(type: string, listener: Listener) {
        const set = this.listeners.get(type) ?? new Set<Listener>();
        set.add(listener);
        this.listeners.set(type, set);
    }

    removeEventListener(type: string, listener: Listener) {
        this.listeners.get(type)?.delete(listener);
    }

    dispatch(type: string, event: unknown = {}) {
        for (const listener of this.listeners.get(type) ?? []) listener(event);
    }

    matches() {
        return this.focusVisible;
    }

    getBoundingClientRect() {
        this.rectReads += 1;
        return rect(100, 100, 40, 40);
    }
}

class FakeDocument {
    readonly listeners = new Map<string, Set<Listener>>();
    readonly created: FakeElement[] = [];
    readonly body = {
        appendChild: (element: FakeElement) => {
            void element;
        },
    };

    createElement() {
        const element = new FakeElement();
        this.created.push(element);
        return element;
    }

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
}

class FakeWindow {
    readonly listeners = new Map<string, Set<Listener>>();
    innerWidth = 1000;
    innerHeight = 800;
    private readonly frames = new Map<number, FrameRequestCallback>();
    private nextFrame = 1;

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

    requestAnimationFrame(callback: FrameRequestCallback) {
        const id = this.nextFrame++;
        this.frames.set(id, callback);
        return id;
    }

    cancelAnimationFrame(id: number) {
        this.frames.delete(id);
    }

    flushFrames() {
        const pending = [...this.frames.values()];
        this.frames.clear();
        for (const callback of pending) callback(0);
    }

    pendingFrames() {
        return this.frames.size;
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
    const globals = globalThis as unknown as Record<string, unknown>;

    globals.window = fakeWindow;
    globals.document = fakeDocument;
    globals.matchMedia = () => ({ matches: true });
    globals.requestAnimationFrame = (callback: FrameRequestCallback) =>
        fakeWindow.requestAnimationFrame(callback);
    globals.cancelAnimationFrame = (id: number) =>
        fakeWindow.cancelAnimationFrame(id);

    return { fakeWindow, fakeDocument };
}

function hover(): PointerEvent {
    return { pointerType: "mouse" } as PointerEvent;
}

test("Escape dismisses a tooltip opened by hover", async () => {
    const { fakeDocument } = installDom();
    const node = new FakeNode();
    const action = accessibleTooltip(node as unknown as HTMLElement, {
        text: "Details",
    });
    const tooltip = fakeDocument.created[0];

    node.dispatch("pointerenter", hover());
    await new Promise((resolve) => setTimeout(resolve, 350));
    assert.equal(Object.hasOwn(tooltip.dataset, "open"), true);

    fakeDocument.dispatch("keydown", { key: "Escape" });
    assert.equal(Object.hasOwn(tooltip.dataset, "open"), false);

    action.destroy();
});

test("Escape listeners do not outlive the open tooltip", () => {
    const { fakeDocument } = installDom();
    const node = new FakeNode();
    const action = accessibleTooltip(node as unknown as HTMLElement, {
        text: "Details",
    });

    assert.equal(fakeDocument.listenerCount("keydown"), 0);

    node.focusVisible = true;
    node.dispatch("focus");
    assert.equal(fakeDocument.listenerCount("keydown"), 1);

    node.dispatch("blur");
    assert.equal(fakeDocument.listenerCount("keydown"), 0);

    action.destroy();
});

test("resize and scroll bursts coalesce into one positioning frame", () => {
    const { fakeWindow } = installDom();
    const node = new FakeNode();
    const action = accessibleTooltip(node as unknown as HTMLElement, {
        text: "Details",
    });

    node.focusVisible = true;
    node.dispatch("focus");
    fakeWindow.flushFrames();
    assert.equal(node.rectReads, 1);

    fakeWindow.dispatch("resize");
    fakeWindow.dispatch("scroll");
    fakeWindow.dispatch("resize");
    assert.equal(fakeWindow.pendingFrames(), 1);

    fakeWindow.flushFrames();
    assert.equal(node.rectReads, 2);

    action.destroy();
});
