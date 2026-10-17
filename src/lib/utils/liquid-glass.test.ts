import test from "node:test";
import assert from "node:assert/strict";

import { liquidGlass } from "./liquid-glass.ts";

type Listener = (event: unknown) => void;

function rect(width: number, height: number): DOMRect {
    return {
        x: 0,
        y: 0,
        width,
        height,
        top: 0,
        right: width,
        bottom: height,
        left: 0,
        toJSON: () => ({}),
    } as DOMRect;
}

class FakeCanvas {
    width = 0;
    height = 0;
    dataUrlCalls = 0;

    getContext() {
        return {
            createImageData: (width: number, height: number) => ({
                data: new Uint8ClampedArray(width * height * 4),
            }),
            putImageData() {},
        };
    }

    toDataURL() {
        this.dataUrlCalls += 1;
        return "data:image/png;base64,stub";
    }
}

class FakeSvg {
    innerHTML = "";
    readonly style: Record<string, string> = {};
    readonly attributes = new Map<string, string>();
    removed = false;

    setAttribute(name: string, value: string) {
        this.attributes.set(name, value);
    }

    querySelector() {
        return new FakeSvg();
    }

    remove() {
        this.removed = true;
    }
}

class FakeNode {
    readonly properties = new Map<string, string>();
    readonly style = {
        setProperty: (name: string, value: string) => {
            this.properties.set(name, value);
        },
        removeProperty: (name: string) => {
            this.properties.delete(name);
        },
    };
    readonly dataset: Record<string, string> = {};
    readonly listeners = new Map<string, Set<Listener>>();
    width = 120;
    height = 80;
    rectReads = 0;

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

    getBoundingClientRect() {
        this.rectReads += 1;
        return rect(this.width, this.height);
    }
}

interface FakeDom {
    canvas: FakeCanvas;
    svg: FakeSvg;
    resize(): void;
    flushFrames(): void;
    pendingFrames(): number;
}

function installDom(): FakeDom {
    const canvas = new FakeCanvas();
    const svg = new FakeSvg();
    const globals = globalThis as unknown as Record<string, unknown>;
    const frames = new Map<number, FrameRequestCallback>();
    let nextFrame = 1;
    let resizeCallback: (() => void) | null = null;

    globals.document = {
        createElement: () => canvas,
        createElementNS: () => svg,
        body: { appendChild: () => {} },
    };
    globals.matchMedia = () => ({ matches: false });
    globals.getComputedStyle = () => ({ borderTopLeftRadius: "12px" });
    globals.requestAnimationFrame = (callback: FrameRequestCallback) => {
        const id = nextFrame++;
        frames.set(id, callback);
        return id;
    };
    globals.cancelAnimationFrame = (id: number) => {
        frames.delete(id);
    };
    globals.ResizeObserver = class {
        constructor(callback: () => void) {
            resizeCallback = callback;
        }
        observe() {}
        disconnect() {}
        unobserve() {}
    };
    Object.defineProperty(globalThis, "navigator", {
        value: { userAgent: "Mozilla/5.0 Chrome/120.0.0.0" },
        configurable: true,
    });

    return {
        canvas,
        svg,
        resize: () => resizeCallback?.(),
        flushFrames: () => {
            const pending = [...frames.values()];
            frames.clear();
            for (const callback of pending) callback(0);
        },
        pendingFrames: () => frames.size,
    };
}

test("destroy clears the stale pointer custom properties", () => {
    const dom = installDom();
    const node = new FakeNode();
    const action = liquidGlass(node as unknown as HTMLElement, {
        interactive: true,
    });

    node.dispatch("pointermove", { pointerType: "mouse", clientX: 10, clientY: 12 });
    dom.flushFrames();
    assert.equal(node.properties.get("--liquid-pointer-x"), "10px");
    assert.equal(node.properties.get("--liquid-pointer-y"), "12px");

    action.destroy();

    assert.equal(node.properties.has("--liquid-pointer-x"), false);
    assert.equal(node.properties.has("--liquid-pointer-y"), false);
    assert.equal(node.properties.has("--liquid-refraction-filter"), false);
    assert.equal(Object.hasOwn(node.dataset, "liquidRefraction"), false);
});

test("resize notifications coalesce and skip unchanged sizes", () => {
    const dom = installDom();
    const node = new FakeNode();
    const action = liquidGlass(node as unknown as HTMLElement);

    // The initial build happens once, outside the frame loop.
    assert.equal(dom.canvas.dataUrlCalls, 1);

    dom.resize();
    dom.resize();
    dom.resize();
    assert.equal(dom.pendingFrames(), 1);
    dom.flushFrames();

    // Same size: the expensive map rebuild is skipped entirely.
    assert.equal(dom.canvas.dataUrlCalls, 1);

    node.width = 240;
    dom.resize();
    dom.flushFrames();
    assert.equal(dom.canvas.dataUrlCalls, 2);

    action.destroy();
});

test("an element too small for a map drops the stale refraction hook", () => {
    const dom = installDom();
    const node = new FakeNode();
    const action = liquidGlass(node as unknown as HTMLElement);

    dom.flushFrames();
    assert.equal(node.properties.has("--liquid-refraction-filter"), true);
    assert.equal(Object.hasOwn(node.dataset, "liquidRefraction"), true);

    node.width = 1;
    node.height = 1;
    dom.resize();
    dom.flushFrames();

    assert.equal(node.properties.has("--liquid-refraction-filter"), false);
    assert.equal(Object.hasOwn(node.dataset, "liquidRefraction"), false);

    action.destroy();
});
