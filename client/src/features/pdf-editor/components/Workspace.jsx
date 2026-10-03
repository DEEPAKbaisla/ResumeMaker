import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Maximize2Icon,
  MinusIcon,
  MoveHorizontalIcon,
  PlusIcon,
} from "lucide-react";
import { MAX_ZOOM, MIN_ZOOM, PAGE_GUTTER, ZOOM_STEP } from "../utils/constants.js";
import { clampZoom, fitPageZoom, fitWidthZoom } from "../utils/coordinates.js";
import PageViewport from "./PageViewport.jsx";

/**
 * Mounts heavy page content when it approaches the viewport. Once mounted a
 * page stays mounted so its canvas keeps the rendered pixels (cheap for
 * typical documents; avoids flicker on scroll-back).
 */
function LazyPage({ children, width, height, pageNumber, registerRef }) {
  const hostRef = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (near) return undefined;
    const node = hostRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { root: null, rootMargin: "900px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);

  return (
    <div
      ref={(node) => {
        hostRef.current = node;
        registerRef?.(pageNumber, node);
      }}
      style={{ width, height }}
      className="shrink-0">
      {near ? children : null}
    </div>
  );
}

function ZoomBar({
  page,
  count,
  zoom,
  onPageChange,
  onZoom,
  onFitWidth,
  onFitPage,
}) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-white border border-slate-200 rounded-full shadow-lg px-2 py-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        title="Previous page"
        aria-label="Previous page"
        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeftIcon className="size-4" />
      </button>
      <input
        type="number"
        min={1}
        max={count}
        value={page}
        onChange={(e) => {
          const next = Number(e.target.value);
          if (next >= 1 && next <= count) onPageChange(next);
        }}
        aria-label="Current page"
        className="w-11 text-center text-sm font-semibold text-slate-700 no-global-input border-0 focus:ring-0 px-0"
      />
      <span className="text-sm text-slate-400 pr-1">/ {count}</span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= count}
        title="Next page"
        aria-label="Next page"
        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRightIcon className="size-4" />
      </button>

      <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

      <button
        onClick={() => onZoom(clampZoom(zoom - ZOOM_STEP))}
        disabled={zoom <= MIN_ZOOM + 0.001}
        title="Zoom out"
        aria-label="Zoom out"
        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <MinusIcon className="size-4" />
      </button>
      <button
        onClick={() => onZoom(1)}
        title="Reset zoom to 100%"
        aria-label={`Zoom level ${Math.round(zoom * 100)} percent, reset to 100`}
        className="text-sm font-semibold text-slate-700 w-14 text-center hover:bg-slate-100 rounded-full py-1 transition-colors tabular-nums">
        {Math.round(zoom * 100)}%
      </button>
      <button
        onClick={() => onZoom(clampZoom(zoom + ZOOM_STEP))}
        disabled={zoom >= MAX_ZOOM - 0.001}
        title="Zoom in"
        aria-label="Zoom in"
        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <PlusIcon className="size-4" />
      </button>

      <span className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

      <button
        onClick={onFitWidth}
        title="Fit to width"
        aria-label="Fit to width"
        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
        <MoveHorizontalIcon className="size-4" />
      </button>
      <button
        onClick={onFitPage}
        title="Fit page"
        aria-label="Fit page"
        className="p-1.5 rounded-full text-slate-600 hover:bg-slate-100 transition-colors">
        <Maximize2Icon className="size-4" />
      </button>
    </div>
  );
}

export default function Workspace({ pdfDoc, pagesMeta, currentPage, onCurrentPageChange, apiRef }) {
  const scrollRef = useRef(null);
  const pageRefs = useRef(new Map());
  const currentPageRef = useRef(currentPage ?? 1);
  currentPageRef.current = currentPage ?? 1;
  const [zoom, setZoom] = useState(1);
  const [, setFitMode] = useState("width"); // 'width' | 'page' | null

  const applyFit = useCallback(
    (mode) => {
      const container = scrollRef.current;
      if (!container || !pagesMeta.length) return;
      if (mode === "width") {
        const widest = Math.max(...pagesMeta.map((p) => p.width));
        setZoom(fitWidthZoom(container.clientWidth, widest));
      } else {
        const page = pagesMeta[currentPage - 1] ?? pagesMeta[0];
        setZoom(
          fitPageZoom(container.clientWidth, container.clientHeight, page.width, page.height)
        );
      }
    },
    [pagesMeta, currentPage]
  );

  // Initial fit + refit on resize while a fit mode is active.
  useEffect(() => {
    applyFit("width");
    const container = scrollRef.current;
    if (!container) return undefined;
    const observer = new ResizeObserver(() => {
      setFitMode((current) => {
        if (current === "width" || current === "page") applyFit(current);
        return current;
      });
    });
    observer.observe(container);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagesMeta.length]);

  // Track the current page from scroll position.
  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const center = container.scrollTop + container.clientHeight / 2;
    let best = 1;
    let bestDistance = Number.POSITIVE_INFINITY;
    pageRefs.current.forEach((node, pageNumber) => {
      if (!node) return;
      const top = node.offsetTop;
      const bottom = top + node.offsetHeight;
      const distance =
        center >= top && center <= bottom
          ? 0
          : Math.min(Math.abs(center - top), Math.abs(center - bottom));
      if (distance < bestDistance) {
        bestDistance = distance;
        best = pageNumber;
      }
    });
    if (best !== currentPageRef.current) {
      currentPageRef.current = best;
      onCurrentPageChange(best);
    }
  }, [onCurrentPageChange]);

  const scrollToPage = useCallback(
    (pageNumber) => {
      const node = pageRefs.current.get(pageNumber);
      const container = scrollRef.current;
      if (node && container) {
        container.scrollTo({ top: node.offsetTop - PAGE_GUTTER / 2, behavior: "smooth" });
      }
      currentPageRef.current = pageNumber;
      onCurrentPageChange(pageNumber);
    },
    [onCurrentPageChange]
  );

  // Expose imperative navigation for the shell (thumbnail clicks).
  useEffect(() => {
    if (apiRef) apiRef.current = { goToPage: scrollToPage };
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef, scrollToPage]);

  const registerRef = useCallback((pageNumber, node) => {
    if (node) pageRefs.current.set(pageNumber, node);
    else pageRefs.current.delete(pageNumber);
  }, []);

  const handleZoom = useCallback((nextZoom) => {
    setFitMode(null);
    setZoom(nextZoom);
  }, []);

  return (
    <main className="absolute inset-0 overflow-hidden bg-slate-100">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-auto py-6"
        role="region"
        aria-label="PDF pages">
        <div className="flex flex-col items-center gap-6 px-4 min-w-max mx-auto w-fit">
          {pagesMeta.map((size, index) => {
            const pageNumber = index + 1;
            return (
              <LazyPage
                key={pageNumber}
                width={size.width * zoom}
                height={size.height * zoom}
                pageNumber={pageNumber}
                registerRef={registerRef}>
                <PageViewport
                  pdfDoc={pdfDoc}
                  pageNumber={pageNumber}
                  size={size}
                  zoom={zoom}
                  registerRef={() => {}}
                />
              </LazyPage>
            );
          })}
        </div>
      </div>

      <ZoomBar
        page={currentPage ?? 1}
        count={pagesMeta.length}
        zoom={zoom}
        onPageChange={scrollToPage}
        onZoom={handleZoom}
        onFitWidth={() => {
          setFitMode("width");
          applyFit("width");
        }}
        onFitPage={() => {
          setFitMode("page");
          applyFit("page");
        }}
      />
    </main>
  );
}
