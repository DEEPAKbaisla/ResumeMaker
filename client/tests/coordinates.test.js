import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  boxFromDrag,
  clampZoom,
  fitPageZoom,
  fitWidthZoom,
  getElementCenter,
  hitTest,
  pageToScreen,
  pointInElement,
  resizeBox,
  rotatePoint,
  scalePointsIntoBox,
  screenToPage,
  translatePoints,
} from "../src/features/pdf-editor/utils/coordinates.js";

describe("screen <-> page conversions", () => {
  test("round-trips at any zoom", () => {
    for (const zoom of [0.25, 0.5, 1, 1.37, 2.5, 4]) {
      const page = { x: 137.4, y: 291.8 };
      const screen = pageToScreen(page.x, page.y, zoom);
      const back = screenToPage(screen.x, screen.y, zoom);
      assert.ok(Math.abs(back.x - page.x) < 1e-9);
      assert.ok(Math.abs(back.y - page.y) < 1e-9);
    }
  });

  test("zoom multiplies screen size linearly", () => {
    assert.equal(pageToScreen(10, 10, 2).x, 20);
    assert.equal(screenToPage(40, 40, 2).y, 20);
  });
});

describe("rotatePoint (top-origin, clockwise positive — matches export math)", () => {
  test("point right of center goes below after +90deg", () => {
    const p = rotatePoint(150, 100, 100, 100, 90);
    assert.ok(Math.abs(p.x - 100) < 1e-9);
    assert.ok(Math.abs(p.y - 150) < 1e-9);
  });

  test("mirrors the server-side conversion for the same visual rotation", () => {
    // Client: top-origin clockwise. Server converts with -angle in PDF space.
    // For a point directly right of center rotated visually by theta, the
    // resulting top-origin y must increase for positive theta.
    const p = rotatePoint(200, 100, 100, 100, 45);
    assert.ok(p.y > 100 && p.x > 100);
  });

  test("full circle returns to start", () => {
    const p = rotatePoint(180, 60, 100, 100, 360);
    assert.ok(Math.abs(p.x - 180) < 1e-9);
    assert.ok(Math.abs(p.y - 60) < 1e-9);
  });
});

describe("resizeBox", () => {
  test("se handle keeps nw corner fixed", () => {
    const el = { x: 50, y: 50, width: 100, height: 80 };
    const out = resizeBox(el, "se", 30, -20);
    assert.deepEqual([out.x, out.y], [50, 50]);
    assert.deepEqual([out.width, out.height], [130, 60]);
  });

  test("nw handle keeps se corner fixed", () => {
    const el = { x: 50, y: 50, width: 100, height: 80 };
    const out = resizeBox(el, "nw", -25, 15);
    assert.deepEqual([out.x, out.y], [25, 65]);
    assert.deepEqual([out.width, out.height], [125, 65]);
  });

  test("clamps to minimum size instead of collapsing", () => {
    const el = { x: 50, y: 50, width: 12, height: 12 };
    const out = resizeBox(el, "se", -500, -500);
    assert.ok(out.width >= 8);
    assert.ok(out.height >= 8);
  });

  test("edge handles move only one axis pair", () => {
    const el = { x: 0, y: 0, width: 100, height: 100 };
    const n = resizeBox(el, "n", 999, 20);
    assert.deepEqual([n.x, n.y, n.width, n.height], [0, 20, 100, 80]);
    const e = resizeBox(el, "e", -30, 999);
    assert.deepEqual([e.x, e.y, e.width, e.height], [0, 0, 70, 100]);
  });
});

describe("scalePointsIntoBox / translatePoints", () => {
  test("maps points proportionally between boxes", () => {
    const from = { x: 0, y: 0, width: 100, height: 100 };
    const to = { x: 10, y: 20, width: 50, height: 200 };
    const pts = scalePointsIntoBox(
      [
        { x: 0, y: 0 },
        { x: 100, y: 100 },
        { x: 50, y: 25 },
      ],
      from,
      to
    );
    assert.deepEqual(pts[0], { x: 10, y: 20 });
    assert.deepEqual(pts[1], { x: 60, y: 220 });
    assert.deepEqual(pts[2], { x: 35, y: 70 });
  });

  test("zero-height boxes do not divide by zero", () => {
    const pts = scalePointsIntoBox([{ x: 5, y: 5 }], { x: 0, y: 0, width: 10, height: 0 }, { x: 0, y: 0, width: 20, height: 0 });
    assert.deepEqual(pts, [{ x: 10, y: 5 }]);
  });

  test("translatePoints shifts every point", () => {
    const out = translatePoints(
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
      ],
      -5,
      10
    );
    assert.deepEqual(out, [
      { x: -4, y: 12 },
      { x: -2, y: 14 },
    ]);
  });
});

describe("hit testing", () => {
  const elements = [
    { id: "a", type: "rect", x: 0, y: 0, width: 100, height: 100 },
    { id: "b", type: "highlight", x: 40, y: 40, width: 100, height: 100 },
  ];

  test("returns the topmost element containing the point", () => {
    assert.equal(hitTest(elements, 60, 60).id, "b");
    assert.equal(hitTest(elements, 10, 10).id, "a");
  });

  test("misses outside every box", () => {
    assert.equal(hitTest(elements, 300, 300), null);
  });

  test("tolerance lets thin strokes be grabbed", () => {
    assert.ok(pointInElement({ x: 100, y: 100, width: 0.5, height: 40 }, 99, 110, 4));
  });
});

describe("boxFromDrag normalizes negative drags", () => {
  test("dragging up-left still yields a top-left origin box", () => {
    const box = boxFromDrag({ x: 200, y: 150 }, { x: 120, y: 90 });
    assert.deepEqual(box, { x: 120, y: 90, width: 80, height: 60 });
  });
});

describe("zoom helpers", () => {
  test("clampZoom bounds", () => {
    assert.equal(clampZoom(0.01), 0.25);
    assert.equal(clampZoom(99), 4);
    assert.equal(clampZoom(Number.NaN), 1);
  });

  test("fitWidth never exceeds container", () => {
    const z = fitWidthZoom(800, 612);
    assert.ok(z * 612 <= 800);
  });

  test("fitPage fits both axes including chrome margins", () => {
    const z = fitPageZoom(612 + 64, 792 + 96, 612, 792);
    assert.ok(z <= 1);
  });

  test("getElementCenter", () => {
    assert.deepEqual(getElementCenter({ x: 10, y: 20, width: 30, height: 40 }), {
      x: 25,
      y: 40,
    });
  });
});
