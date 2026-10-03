import React, { useEffect, useRef, useState } from "react";

/**
 * Left rail of page thumbnails. Each thumbnail renders lazily when scrolled
 * into view, at a small fixed scale, and is cached afterwards.
 */
function Thumbnail({ pdfDoc, pageNumber, size, isActive, onClick }) {
  const canvasRef = useRef(null);
  const hostRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hostRef.current || visible) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setVisible(true);
      },
      { root: null, rootMargin: "200px" }
    );
    observer.observe(hostRef.current);
    return () => observer.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !pdfDoc || !canvasRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        const base = page.getViewport({ scale: 1 });
        const targetHeight = 128;
        const scale = targetHeight / base.height;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        canvas.width = Math.floor(viewport.width * 2); // 2x for sharpness
        canvas.height = Math.floor(viewport.height * 2);
        const ctx = canvas.getContext("2d");
        ctx.scale(2, 2);
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) canvas.width = 0;
      } catch {
        // rendering failures in thumbnails are non-fatal
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [visible, pdfDoc, pageNumber]);

  const aspect = size.height ? size.width / size.height : 0.75;

  return (
    <button
      ref={hostRef}
      onClick={onClick}
      title={`Go to page ${pageNumber}`}
      aria-label={`Go to page ${pageNumber}`}
      aria-current={isActive ? "true" : "false"}
      className={`relative rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white ${
        isActive
          ? "border-blue-500 shadow-md"
          : "border-slate-200 hover:border-blue-300"
      }`}
      style={{ width: 96 + 12, height: 96 / aspect + 12 }}>
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width: 96, height: 96 / aspect }}
      />
      <span
        className={`absolute bottom-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
          isActive ? "bg-blue-600 text-white" : "bg-slate-900/70 text-white"
        }`}>
        {pageNumber}
      </span>
    </button>
  );
}

export default function ThumbnailRail({
  pdfDoc,
  pagesMeta,
  currentPage,
  onPageSelect,
}) {
  return (
    <nav
      aria-label="Page thumbnails"
      className="hidden xl:flex flex-col gap-3 items-center bg-slate-100/70 border-r border-slate-200 p-3 overflow-y-auto w-[132px] shrink-0">
      {pagesMeta.map((size, index) => (
        <Thumbnail
          key={index}
          pdfDoc={pdfDoc}
          pageNumber={index + 1}
          size={size}
          isActive={currentPage === index + 1}
          onClick={() => onPageSelect(index + 1)}
        />
      ))}
    </nav>
  );
}
