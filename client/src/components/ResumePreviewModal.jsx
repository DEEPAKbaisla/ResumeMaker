import React, { useRef, useState } from "react";
import {
  DownloadIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
  Loader2Icon,
} from "lucide-react";
import ResumePreview from "./ResumePreview";
import { useReactToPrint } from "react-to-print";

const ResumePreviewModal = ({ isOpen, onClose, resumeData }) => {
  const resumeRef = useRef(null);
  const [zoom, setZoom] = useState(0.6);
  const [isDownloading, setIsDownloading] = useState(false);

  const handlePrint = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: resumeData.personal_info?.full_name || "Resume",
  });

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.5));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.3));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm gap-2">
        {/* Title - hidden on very small screens */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
            <DownloadIcon className="size-3.5 sm:size-4 text-white" />
          </div>
          <div className="hidden sm:block min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              Resume Preview
            </h2>
            <p className="text-xs text-gray-500 truncate">
              Review before downloading
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* Zoom Controls */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-lg p-0.5 sm:p-1 mr-1 sm:mr-2">
            <button
              onClick={zoomOut}
              className="p-1 sm:p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
              title="Zoom Out">
              <ZoomOutIcon className="size-3.5 sm:size-4" />
            </button>
            <span className="text-[10px] sm:text-xs font-medium text-gray-600 min-w-[2.5rem] sm:min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1 sm:p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all text-gray-600"
              title="Zoom In">
              <ZoomInIcon className="size-3.5 sm:size-4" />
            </button>
          </div>

          {/* Download Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm hover:shadow-md">
            <DownloadIcon className="size-4" />
            Download PDF
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-all text-gray-500 hover:text-gray-700"
            title="Close Preview">
            <XIcon className="size-4 sm:size-5" />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="relative z-10 flex-1 overflow-auto bg-gray-800/40 flex justify-center py-4 sm:py-8 px-2 sm:px-4">
        <div
          className="transition-transform duration-200 ease-out origin-top"
          style={{ transform: `scale(${zoom})` }}>
          <div className="shadow-2xl rounded-sm overflow-hidden ring-1 ring-black/10">
            <ResumePreview
              ref={resumeRef}
              data={resumeData}
              template={resumeData.template}
              accentColor={resumeData.accent_color}
            />
          </div>
        </div>
      </div>

      {/* Bottom hint bar - hidden on mobile */}
      <div className="relative z-10 hidden sm:flex items-center justify-center py-2 bg-white/90 backdrop-blur border-t border-gray-200">
        <p className="text-xs text-gray-400">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">
            Esc
          </kbd>{" "}
          to close &nbsp;·&nbsp; Scroll to navigate &nbsp;·&nbsp; Use zoom
          controls to resize
        </p>
      </div>
    </div>
  );
};

export default ResumePreviewModal;
