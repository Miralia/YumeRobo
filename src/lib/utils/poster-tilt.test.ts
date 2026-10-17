import test from "node:test";
import assert from "node:assert/strict";

import { POSTER_TILT_RESET_EVENT, posterTilt } from "./poster-tilt.ts";

type Listener = (event: unknown) => void;

function rect(): DOMRect {
    return {
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        top: 0,
        right: 100,
        bottom: 100,
        left: 0,
        toJSON: () => ({}),
    } as DOMRect;
}

class FakeNode {
    readonly attributes = new Set<string>();
    readonly dataset: Record<string, string> = {};
    readonly listeners = new Map<string, Set<Listener>>();
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

    setAttribute(name: string) {
        this.attributes.add(name);
    }

    removeAttribute(name: string) {
        this.attributes.delete(name);
    }

    hasAttribute(name: string) {
        return this.attributes.has(name);
    }

    matches() {
        return false;
    }

    getBoundingClientRect() {
        this.rectReads += 1;
        return rect();
    }

    style = {
        setProperty() {},
        removeProperty() {},
    };
}

class FakeWindow {
    readonly listeners = new Map<string, Set<Listener>>();
    readonly frames: number[] = [];
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

    matchMedia(query: string): MediaQueryList {
        const matches = query.includes("any-hover");
        return {
            media: query,
            matches,
            addEventListener() {},
            removeEventListener() {},
        } as unknown as MediaQueryList;
    }

    requestAnimationFrame(callback: FrameRequestCallback) {
        this.frames.push(this.nextFrame);
        void callback;
        return this.nextFrame++;
    }

    cancelAnimationFrame(id: number) {
        this.frames.splice(this.frames.indexOf(id), 1);
    }
}

function installDom(): FakeWindow {
    const fakeWindow = new FakeWindow();
    const globals = globalThis as unknown as Record<string, unknown>;
    globals.window = fakeWindow;
    globals.requestAnimationFrame = (callback: FrameRequestCallback) =>
        fakeWindow.requestAnimationFrame(callback);
    globals.cancelAnimationFrame = (id: number) =>
        fakeWindow.cancelAnimationFrame(id);
    return fakeWindow;
}

function pointer(clientX: number, clientY: number) {
    return { pointerType: "mouse", clientX, clientY };
}

test("a window blur after a navigation freeze leaves the card usable", () => {
    const fakeWindow = installDom();
    const node = new FakeNode();
    const action = posterTilt(node as unknown as HTMLElement);

    // The layout freezes the pose for the view transition, then the window
    // loses focus before settle()/restorePreservedInteraction() can run.
    fakeWindow.dispatch(POSTER_TILT_RESET_EVENT);
    fakeWindow.dispatch("blur");

    node.dispatch("pointerenter", pointer(10, 10));

    assert.equal(node.hasAttribute("data-poster-active"), true);
    assert.equal(node.hasAttribute("data-poster-hover"), true);

    action.destroy();
});

test("a frozen card ignores pointer input until it is released", () => {
    const fakeWindow = installDom();
    const node = new FakeNode();
    const action = posterTilt(node as unknown as HTMLElement);

    fakeWindow.dispatch(POSTER_TILT_RESET_EVENT);
    node.dispatch("pointerenter", pointer(10, 10));

    assert.equal(node.hasAttribute("data-poster-active"), false);

    action.destroy();
});

test("scroll and resize invalidate the cached bounds without per-move reads", () => {
    const fakeWindow = installDom();
    const node = new FakeNode();
    const action = posterTilt(node as unknown as HTMLElement);

    node.dispatch("pointerenter", pointer(10, 10));
    assert.equal(node.rectReads, 1);

    node.dispatch("pointermove", pointer(20, 20));
    assert.equal(node.rectReads, 1);

    fakeWindow.dispatch("scroll");
    node.dispatch("pointermove", pointer(30, 30));
    assert.equal(node.rectReads, 2);

    fakeWindow.dispatch("resize");
    node.dispatch("pointermove", pointer(40, 40));
    assert.equal(node.rectReads, 3);

    action.destroy();
});
