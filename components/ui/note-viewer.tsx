"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FaFilePdf,
  FaFileImage,
  FaFileWord,
  FaFilePowerpoint,
  FaDownload,
  FaShareNodes,
  FaExpand,
  FaCompress,
  FaRotateLeft,
  FaRotateRight,
  FaMagnifyingGlassPlus,
  FaMagnifyingGlassMinus,
  FaXmark,
  FaArrowUpRightFromSquare,
} from "react-icons/fa6";
import { cn } from "@/lib/utils";

interface NoteViewerProps {
  note: {
    fileUrl?: string;
    fileName: string;
    fileType: string;
    title: string;
  };
  isOpen: boolean;
  onClose: () => void;
  actions?: React.ReactNode;
}

function extOf(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "heic", "gif"];
const WORD_EXTS = ["doc", "docx"];
const PPT_EXTS = ["ppt", "pptx"];

function fileIcon(type: string, name: string) {
  const t = type.toLowerCase();
  const ext = extOf(name);
  if (t.includes("pdf") || ext === "pdf") return FaFilePdf;
  if (t.includes("image") || IMAGE_EXTS.includes(ext)) return FaFileImage;
  if (t.includes("word") || t.includes("doc") || WORD_EXTS.includes(ext))
    return FaFileWord;
  if (t.includes("powerpoint") || t.includes("ppt") || PPT_EXTS.includes(ext))
    return FaFilePowerpoint;
  return FaFilePdf;
}

function isPdf(type: string, name: string) {
  return type.toLowerCase().includes("pdf") || extOf(name) === "pdf";
}

function isImage(type: string, name: string) {
  return (
    type.toLowerCase().includes("image") || IMAGE_EXTS.includes(extOf(name))
  );
}

function isOfficeDoc(type: string, name: string) {
  const t = type.toLowerCase();
  const ext = extOf(name);
  return (
    /word|doc|powerpoint|ppt|msword|officedocument/.test(t) ||
    WORD_EXTS.includes(ext) ||
    PPT_EXTS.includes(ext)
  );
}

export function NoteViewer({ note, isOpen, onClose, actions }: NoteViewerProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fileType = note.fileType;
  const fileUrl = note.fileUrl;

  // Detect mobile/tablet devices (iOS + Android don't support inline PDF iframes)
  useEffect(() => {
    const mobileRe = /android|ipad|iphone|ipod|mobile|tablet|touch/i;
    const mobile =
      mobileRe.test(navigator.userAgent) || ("ontouchstart" in window && window.innerWidth < 1024);
    setIsMobile(mobile);
    // Google Docs Viewer has its own loading UI and doesn't reliably fire onLoad,
    // so clear the spinner immediately on mobile.
    if (mobile) setLoading(false);
  }, []);

  // For PDF on mobile: use Google Docs Viewer which renders cross-device
  const pdfEmbedUrl = useMemo(() => {
    if (!fileUrl || !isPdf(fileType, note.fileName)) return null;
    if (isMobile) {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    }
    return fileUrl;
  }, [fileUrl, fileType, note.fileName, isMobile]);

  const handleLoad = () => setLoading(false);
  const handleError = () => {
    setLoading(false);
    setError("Failed to load document. The file may have been moved or deleted.");
  };

  const download = async () => {
    if (!fileUrl) return;
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = note.fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(fileUrl, "_blank");
    }
  };

  const share = async () => {
    const shareData = {
      title: note.title,
      text: `Check out this note: ${note.title}`,
      url: window.location.origin + "/browse",
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.origin + "/browse");
    alert("Link copied to clipboard!");
  };

  const openInNewTab = () => {
    if (fileUrl) window.open(fileUrl, "_blank");
  };

  const zoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const rotateLeft = () => setRotation((r) => r - 90);
  const rotateRight = () => setRotation((r) => r + 90);
  const resetView = () => {
    setScale(1);
    setRotation(0);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    if (!isFullscreen && containerRef.current) {
      containerRef.current.requestFullscreen?.().catch(() => {});
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Lock body scroll when modal is open so background page doesn't scroll on mobile.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isOpen]);

  // Reset zoom/rotation and loading state whenever a new note is opened.
  useEffect(() => {
    if (!isOpen) return;
    setScale(1);
    setRotation(0);
    setError(null);
    setLoading(isPdf(fileType, note.fileName) || isImage(fileType, note.fileName));
  }, [isOpen, fileUrl, fileType, note.fileName]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
        style={{ touchAction: "none" }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
        />
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className={cn(
            "relative w-full max-w-6xl h-[90vh] flex flex-col rounded-3xl border border-white/70 bg-white shadow-2xl overflow-hidden",
            isFullscreen && "fixed inset-0 max-w-none rounded-none border-0 h-full z-50"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-800 shrink-0">
                {note.fileType}
              </span>
              <h2 id="viewer-title" className="text-lg font-bold tracking-tight text-slate-950 truncate">
                {note.title}
              </h2>
              <span className="text-xs text-slate-500 shrink-0">{note.fileName}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {actions && <div className="flex items-center gap-2 mr-2">{actions}</div>}
              <button
                onClick={download}
                className="grid size-8 place-items-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                title="Download"
                aria-label="Download document"
              >
                <FaDownload className="size-4" />
              </button>
              <button
                onClick={share}
                className="grid size-8 place-items-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                title="Share"
                aria-label="Share document"
              >
                <FaShareNodes className="size-4" />
              </button>
              <button
                onClick={openInNewTab}
                className="grid size-8 place-items-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                title="Open in new tab"
                aria-label="Open in new tab"
              >
                <FaArrowUpRightFromSquare className="size-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="grid size-8 place-items-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {isFullscreen ? <FaCompress className="size-4" /> : <FaExpand className="size-4" />}
              </button>
              <button
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors ml-1"
                title="Close"
                aria-label="Close viewer"
              >
                <FaXmark className="size-4" />
              </button>
            </div>
          </div>

          {/* Viewer Controls */}
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 p-3 bg-slate-50/30 backdrop-blur-sm shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                disabled={scale <= 0.5}
                className="grid size-8 place-items-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <FaMagnifyingGlassMinus className="size-4" />
              </button>
              <span className="px-3 text-sm font-mono text-slate-700 min-w-[4rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                disabled={scale >= 3}
                className="grid size-8 place-items-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <FaMagnifyingGlassPlus className="size-4" />
              </button>
              <button
                onClick={resetView}
                className="grid size-8 place-items-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 ml-2"
                title="Reset view"
                aria-label="Reset view"
              >
                <FaRotateLeft className="size-4" />
              </button>
              <button
                onClick={rotateLeft}
                className="grid size-8 place-items-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                title="Rotate left"
                aria-label="Rotate left"
              >
                <FaRotateLeft className="size-4" />
              </button>
              <button
                onClick={rotateRight}
                className="grid size-8 place-items-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                title="Rotate right"
                aria-label="Rotate right"
              >
                <FaRotateRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Document Viewer */}
          <div
            className="relative flex-1 overflow-auto bg-slate-100 overscroll-contain"
            style={{ touchAction: "pan-y pan-x" }}
            onClick={(e) => e.stopPropagation()}
          >
            {!fileUrl ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <FaFilePdf className="size-16 text-slate-400 mx-auto" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">No file available</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    This note does not have an associated file.
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  <FaFilePdf className="size-16 text-rose-500 mx-auto" />
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">Unable to load document</h3>
                  <p className="mt-2 text-sm text-slate-600">{error}</p>
                  <button
                    onClick={openInNewTab}
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    <FaArrowUpRightFromSquare className="size-3.5" />
                    Open in new tab
                  </button>
                </div>
              </div>
            ) : isPdf(fileType, note.fileName) ? (
              isMobile ? (
                /* ── Mobile: Google Docs Viewer (has its own loading UI) ── */
                <div className="flex h-full flex-col">
                  <iframe
                    ref={iframeRef}
                    src={pdfEmbedUrl ?? undefined}
                    className="flex-1 w-full border-0"
                    title={note.title}
                    allow="fullscreen"
                  />
                  {/* Persistent fallback banner */}
                  <div className="shrink-0 flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
                    <span className="text-xs text-slate-500">Can&apos;t see the PDF? Open it directly.</span>
                    <button
                      onClick={openInNewTab}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 active:scale-95 transition-transform"
                    >
                      <FaArrowUpRightFromSquare className="size-3" />
                      Open PDF
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Desktop: native browser PDF iframe ── */
                <>
                  {loading && <ViewerSpinner />}
                  <iframe
                    ref={iframeRef}
                    src={fileUrl}
                    className="h-full w-full border-0"
                    style={{
                      transform: `scale(${scale}) rotate(${rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                    title={note.title}
                    onLoad={handleLoad}
                    onError={handleError}
                    allow="fullscreen"
                  />
                </>
              )
            ) : isImage(fileType, note.fileName) ? (
              <>
                {loading && <ViewerSpinner />}
                <div className="flex h-full items-center justify-center p-4">
                  <img
                    src={fileUrl}
                    alt={note.title}
                    className="max-h-full max-w-full object-contain"
                    style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
                    onLoad={handleLoad}
                    onError={handleError}
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                  {(() => {
                    const Icon = fileIcon(fileType, note.fileName);
                    return <Icon className="size-16 text-slate-400 mx-auto" />;
                  })()}
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {isOfficeDoc(fileType, note.fileName)
                      ? "Office Document Preview"
                      : "Document Preview"}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    In-browser preview isn&apos;t available for {note.fileType}. Download
                    the file to view it.
                  </p>
                  <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <button
                      onClick={download}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      <FaDownload className="size-3.5" />
                      Download
                    </button>
                    <button
                      onClick={openInNewTab}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <FaArrowUpRightFromSquare className="size-3.5" />
                      Open in new tab
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ViewerSpinner() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <div className="size-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
        <span className="text-sm">Loading document...</span>
      </div>
    </div>
  );
}