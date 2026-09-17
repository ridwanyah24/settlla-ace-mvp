"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { PenTool, Keyboard, Trash2 } from "lucide-react";

interface DigitalSignaturePadProps {
  signerName: string;
  onSignatureChange: (signatureDataUrl: string | null) => void;
  title?: string;
  roleLabel?: string;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  signerName,
  onSignatureChange,
  title = "Draw or Type Official Digital Signature",
  roleLabel = "Authorized Signatory",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [typedName, setTypedName] = useState(signerName || "");
  const [selectedScript, setSelectedScript] = useState<"script1" | "script2" | "script3">("script1");
  const [inkColor, setInkColor] = useState("#0B1528"); // Navy/Black legal ink
  const strokeWidth = 2.5;

  // Sync typed name when signerName prop changes
  useEffect(() => {
    if (signerName && !typedName) {
      setTypedName(signerName);
    }
  }, [signerName, typedName]);

  const drawBaselineGuide = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "#CBD5E1"; // light slate dash
    ctx.lineWidth = 1;
    ctx.moveTo(24, height - 34);
    ctx.lineTo(width - 24, height - 34);
    ctx.stroke();

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#94A3B8";
    ctx.fillText("— SIGN ABOVE THIS LINE —", 24, height - 20);
    ctx.restore();
  };

  // Canvas context configuration
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Handle high DPI displays
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;

    // Draw light baseline guide
    drawBaselineGuide(ctx, rect.width, rect.height);
  }, [inkColor, strokeWidth]);

  useEffect(() => {
    setupCanvas();
    const handleResize = () => setupCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setupCanvas]);

  // Coordinate helper
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = inkColor;
    ctx.lineWidth = strokeWidth;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png");
      onSignatureChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    drawBaselineGuide(ctx, canvas.width / dpr, canvas.height / dpr);
    setHasDrawn(false);
    onSignatureChange(null);
  };

  // Render Typed Signature to Canvas
  const applyTypedSignature = useCallback(
    (name: string, scriptStyle: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      ctx.clearRect(0, 0, width, height);
      drawBaselineGuide(ctx, width, height);

      if (!name.trim()) {
        onSignatureChange(null);
        setHasDrawn(false);
        return;
      }

      ctx.save();
      ctx.fillStyle = inkColor;

      let fontStyle = 'italic 34px "Brush Script MT", "Segoe Script", cursive';
      if (scriptStyle === "script2") {
        fontStyle = 'italic 32px "Lucida Handwriting", "Snell Roundhand", cursive';
      } else if (scriptStyle === "script3") {
        fontStyle = 'italic 30px "Apple Chancery", "Bickham Script Pro", cursive';
      }

      ctx.font = fontStyle;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(name, width / 2, height / 2 - 4);
      ctx.restore();

      setHasDrawn(true);
      const dataUrl = canvas.toDataURL("image/png");
      onSignatureChange(dataUrl);
    },
    [inkColor, onSignatureChange]
  );

  useEffect(() => {
    if (mode === "type") {
      applyTypedSignature(typedName, selectedScript);
    }
  }, [mode, typedName, selectedScript, applyTypedSignature]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/60">
            {roleLabel}
          </span>
          <h4 className="text-sm font-black text-slate-900 mt-1">{title}</h4>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-semibold self-stretch sm:self-auto justify-center">
          <button
            type="button"
            onClick={() => {
              setMode("draw");
              clearCanvas();
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              mode === "draw" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Draw</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("type");
              applyTypedSignature(typedName || signerName, selectedScript);
            }}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              mode === "type" ? "bg-white text-blue-700 shadow-2xs font-bold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Type Name</span>
          </button>
        </div>
      </div>

      {/* Mode 2: Type Signature Input Field */}
      {mode === "type" && (
        <div className="mb-3 space-y-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter your exact legal name"
              value={typedName}
              onChange={(e) => {
                setTypedName(e.target.value);
                applyTypedSignature(e.target.value, selectedScript);
              }}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-bold text-slate-500">Legal Script:</span>
            <button
              type="button"
              onClick={() => setSelectedScript("script1")}
              className={`px-2.5 py-1 rounded-lg border text-xs italic ${
                selectedScript === "script1"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Classic Elegance
            </button>
            <button
              type="button"
              onClick={() => setSelectedScript("script2")}
              className={`px-2.5 py-1 rounded-lg border text-xs italic ${
                selectedScript === "script2"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Formal Executive
            </button>
            <button
              type="button"
              onClick={() => setSelectedScript("script3")}
              className={`px-2.5 py-1 rounded-lg border text-xs italic ${
                selectedScript === "script3"
                  ? "border-blue-500 bg-blue-50 text-blue-700 font-bold"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Chancery Cursive
            </button>
          </div>
        </div>
      )}

      {/* Canvas Drawing Surface */}
      <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-[#FAFBFD] overflow-hidden group hover:border-blue-400 transition-colors">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-40 sm:h-44 touch-none cursor-crosshair block"
        />

        {/* Ink / Customization Overlay */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            title="Midnight Navy Legal Ink"
            onClick={() => {
              setInkColor("#0B1528");
              if (mode === "type") applyTypedSignature(typedName, selectedScript);
            }}
            className={`h-5 w-5 rounded-full bg-[#0B1528] border-2 ${
              inkColor === "#0B1528" ? "border-blue-500 scale-110" : "border-white"
            } transition-transform cursor-pointer`}
          />
          <button
            type="button"
            title="Royal Blue Ink"
            onClick={() => {
              setInkColor("#1D4ED8");
              if (mode === "type") applyTypedSignature(typedName, selectedScript);
            }}
            className={`h-5 w-5 rounded-full bg-[#1D4ED8] border-2 ${
              inkColor === "#1D4ED8" ? "border-blue-500 scale-110" : "border-white"
            } transition-transform cursor-pointer`}
          />
          <button
            type="button"
            title="Executive Slate Ink"
            onClick={() => {
              setInkColor("#334155");
              if (mode === "type") applyTypedSignature(typedName, selectedScript);
            }}
            className={`h-5 w-5 rounded-full bg-[#334155] border-2 ${
              inkColor === "#334155" ? "border-blue-500 scale-110" : "border-white"
            } transition-transform cursor-pointer`}
          />
        </div>

        {/* Clear Action Button */}
        {hasDrawn && (
          <button
            type="button"
            onClick={clearCanvas}
            className="absolute bottom-2.5 right-2.5 rounded-xl border border-slate-200 bg-white/95 px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 shadow-xs transition-colors cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Pad</span>
          </button>
        )}
      </div>

      {/* Signature Pad Footer & Enforceability Notice */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full ${hasDrawn ? "bg-emerald-500" : "bg-amber-400"}`} />
          <span className="font-semibold text-slate-700">
            {hasDrawn ? "Valid digital signature captured" : "Awaiting signature on pad above"}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Cryptographically hashed via SHA-256 upon submission
        </span>
      </div>
    </div>
  );
};
