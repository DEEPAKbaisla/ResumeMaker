import React, { useRef, useState } from "react";
import {
  FileTextIcon,
  FilePenLineIcon,
  LoaderCircleIcon,
  TrashIcon,
  UploadCloudIcon,
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { MAX_UPLOAD_MB } from "../utils/constants.js";

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EditorLanding({
  documents,
  uploadProgress,
  onUpload,
  onOpen,
  onDelete,
  error,
}) {
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState("");
  const inputRef = useRef(null);
  const uploading = uploadProgress !== null;

  const validateAndSend = (file) => {
    setLocalError("");
    if (!file) return;
    const isPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      setLocalError("Only PDF files are supported.");
      return;
    }
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setLocalError(`PDF must be ${MAX_UPLOAD_MB} MB or smaller.`);
      return;
    }
    onUpload(file);
  };

  const showProgress = uploading && uploadProgress > 0;

  return (
    <>
      <Helmet>
        <title>PDF Editor | AI Resume Builder</title>
        <meta
          name="description"
          content="Edit PDF files online: add text, signatures, shapes, highlights and images, then download the result."
        />
      </Helmet>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="size-14 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-5">
            <FilePenLineIcon className="size-7 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Edit PDF
          </h1>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">
            Upload a PDF to add text, signatures, drawings, shapes and images
            &mdash; then download the finished document.
          </p>
        </div>

        {/* Dropzone */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload a PDF file"
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !uploading) {
              inputRef.current?.click();
            }
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (!uploading) validateAndSend(e.dataTransfer.files?.[0]);
          }}
          className={`group border-2 border-dashed rounded-3xl bg-white p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
            dragOver
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/40"
          }`}>
          {uploading ? (
            <>
              <LoaderCircleIcon className="size-10 text-blue-600 animate-spin" />
              <p className="font-medium text-slate-700">Uploading your PDF&hellip;</p>
              {showProgress && (
                <div className="w-56 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="size-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center group-hover:border-blue-300 group-hover:bg-white transition-colors">
                <UploadCloudIcon className="size-6 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="font-semibold text-slate-700">Drop your PDF here</p>
              <p className="text-sm text-slate-400 -mt-2">
                or click to choose a file &middot; max {MAX_UPLOAD_MB} MB
              </p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              validateAndSend(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {(localError || error) && (
          <p className="mt-4 text-center text-sm font-medium text-red-600" role="alert">
            {localError || error}
          </p>
        )}

        {/* Recent documents */}
        {documents.length > 0 && (
          <div className="mt-14">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
              Your documents
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <li
                  key={doc._id}
                  className="group bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 hover:border-blue-300 hover:shadow-md transition-all">
                  <button
                    onClick={() => onOpen(doc._id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    title={`Open ${doc.fileName}`}>
                    <span className="size-10 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
                      <FileTextIcon className="size-5 text-red-500" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-slate-800 truncate">
                        {doc.fileName}
                      </span>
                      <span className="block text-xs text-slate-400 mt-0.5">
                        {doc.pageCount} page{doc.pageCount === 1 ? "" : "s"}
                        {doc.fileSize ? ` · ${formatBytes(doc.fileSize)}` : ""}
                        {" · "}
                        {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => onDelete(doc._id)}
                    title="Delete document"
                    aria-label={`Delete ${doc.fileName}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                    <TrashIcon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </>
  );
}
