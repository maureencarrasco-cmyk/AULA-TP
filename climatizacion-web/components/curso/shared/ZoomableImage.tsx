"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type WheelEvent as ReactWheelEvent,
  type PointerEvent as ReactPointerEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

type ZoomableImageProps = {
  src: string;
  alt: string;
  className?: string;
  maxHeightClass?: string;
  children?: ReactNode;
};

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.35;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export default function ZoomableImage({
  src,
  alt,
  className,
  maxHeightClass = "max-h-[420px]",
  children,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originTx: number;
    originTy: number;
  } | null>(null);
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const transformRef = useRef({ scale: 1, tx: 0, ty: 0 });

  useEffect(() => {
    transformRef.current = { scale, tx, ty };
  }, [scale, tx, ty]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener?.("change", sync);
    return () => mq.removeEventListener?.("change", sync);
  }, []);

  const resetTransform = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  const openLightbox = useCallback(() => {
    resetTransform();
    setOpen(true);
  }, [resetTransform]);

  const closeLightbox = useCallback(() => {
    setOpen(false);
    resetTransform();
    setDragging(false);
    dragRef.current = null;
    pinchRef.current = null;
  }, [resetTransform]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeLightbox();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, closeLightbox]);

  const zoomAt = useCallback(
    (nextScale: number, clientX?: number, clientY?: number) => {
      const stage = stageRef.current;
      const { scale: prevScale, tx: prevTx, ty: prevTy } = transformRef.current;
      const clamped = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      if (!stage || clientX == null || clientY == null) {
        setScale(clamped);
        if (clamped <= MIN_SCALE) {
          setTx(0);
          setTy(0);
        }
        return;
      }
      const rect = stage.getBoundingClientRect();
      const cx = clientX - rect.left - rect.width / 2;
      const cy = clientY - rect.top - rect.height / 2;
      const ratio = clamped / prevScale;
      setScale(clamped);
      if (clamped <= MIN_SCALE) {
        setTx(0);
        setTy(0);
      } else {
        setTx(cx - (cx - prevTx) * ratio);
        setTy(cy - (cy - prevTy) * ratio);
      }
    },
    [],
  );

  const onWheel = (e: ReactWheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    zoomAt(transformRef.current.scale + delta, e.clientX, e.clientY);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (transformRef.current.scale <= MIN_SCALE && e.pointerType === "mouse") {
      return;
    }
    if (e.button !== 0 && e.pointerType === "mouse") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originTx: transformRef.current.tx,
      originTy: transformRef.current.ty,
    };
    setDragging(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (transformRef.current.scale <= MIN_SCALE) return;
    setTx(drag.originTx + (e.clientX - drag.startX));
    setTy(drag.originTy + (e.clientY - drag.startY));
  };

  const endDrag = (e: ReactPointerEvent) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const a = e.touches[0];
      const b = e.touches[1];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      pinchRef.current = { dist, scale: transformRef.current.scale };
      dragRef.current = null;
      setDragging(false);
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const a = e.touches[0];
      const b = e.touches[1];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      const midX = (a.clientX + b.clientX) / 2;
      const midY = (a.clientY + b.clientY) / 2;
      const next =
        pinchRef.current.scale * (dist / Math.max(pinchRef.current.dist, 1));
      zoomAt(next, midX, midY);
    }
  };

  const onTouchEnd = () => {
    if (pinchRef.current) pinchRef.current = null;
  };

  const onAmpliarKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      openLightbox();
    }
  };

  const onInlineDoubleClick = (e: ReactMouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-hotspot], [data-zoom-ignore]")) return;
    e.stopPropagation();
    openLightbox();
  };

  const transitionClass = reduceMotion
    ? ""
    : "transition-transform duration-150 ease-out";

  return (
    <>
      <div
        className={`relative mx-auto w-full bg-[var(--aula-bg)] ${maxHeightClass}`}
        onDoubleClick={onInlineDoubleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className={
            className ?? `mx-auto ${maxHeightClass} w-full object-contain`
          }
        />
        {children}
        <button
          type="button"
          data-zoom-ignore
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            openLightbox();
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            openLightbox();
          }}
          onKeyDown={onAmpliarKeyDown}
          className="absolute bottom-2 right-2 z-20 rounded-lg border border-white/30 bg-slate-900/75 px-2.5 py-1.5 text-xs font-semibold text-white shadow-md backdrop-blur-sm hover:bg-slate-900/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aula-blue)] focus-visible:ring-offset-2"
          aria-label="Ampliar imagen"
        >
          Ampliar
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Imagen ampliada"
          className="fixed inset-0 z-50 flex flex-col bg-black/90"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-2 text-white">
            <p className="truncate text-sm font-medium opacity-90">{alt}</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={() => zoomAt(transformRef.current.scale + ZOOM_STEP)}
                aria-label="Acercar"
              >
                Zoom +
              </button>
              <button
                type="button"
                className="rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={() => zoomAt(transformRef.current.scale - ZOOM_STEP)}
                aria-label="Alejar"
              >
                Zoom −
              </button>
              <button
                type="button"
                className="rounded-md bg-white/10 px-2.5 py-1.5 text-xs font-semibold hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={resetTransform}
              >
                Restablecer
              </button>
              <button
                ref={closeBtnRef}
                type="button"
                className="rounded-md bg-white/15 px-2.5 py-1.5 text-sm font-bold hover:bg-white/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
                onClick={closeLightbox}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
          </div>

          <div
            ref={stageRef}
            className={`relative min-h-0 flex-1 overflow-hidden ${
              scale > 1
                ? dragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-in"
            }`}
            onClick={(e) => {
              if (e.target === e.currentTarget) closeLightbox();
            }}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onDoubleClick={(e) => {
              e.preventDefault();
              if (transformRef.current.scale > 1) resetTransform();
              else zoomAt(2, e.clientX, e.clientY);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              className={`pointer-events-none absolute left-1/2 top-1/2 max-h-[calc(100%-1rem)] max-w-[calc(100%-1rem)] select-none object-contain ${transitionClass} ${
                dragging || reduceMotion ? "!transition-none" : ""
              }`}
              style={{
                transform: `translate(-50%, -50%) translate(${tx}px, ${ty}px) scale(${scale})`,
                transformOrigin: "center center",
              }}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
