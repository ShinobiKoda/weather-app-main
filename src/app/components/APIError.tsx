"use client";

import { MouseEventHandler, MouseEvent, useState } from "react";
import { MdOutlineDoNotDisturb } from "react-icons/md";
import { CiLocationOff } from "react-icons/ci";
import { RiLoopRightFill } from "react-icons/ri";
import { FaArrowLeftLong } from "react-icons/fa6";
import { motion } from "motion/react";
import { notFoundBounce } from "./animations/motion";

type APIErrorProps = {
  message?: string;
  onRetry?: MouseEventHandler<HTMLButtonElement> | (() => void);
  previewOffset?: number;
  onPreviewChange?: (v: number) => void;
  onPreviewStart?: () => void;
  onPreviewEnd?: () => void;
};

export function APIError({
  message,
  onRetry,
  previewOffset,
  onPreviewChange,
  onPreviewStart,
  onPreviewEnd,
}: APIErrorProps) {
  const [retrySpinning, setRetrySpinning] = useState(false);

  // Preserve props for future interactive preview features; avoid unused warnings
  (() => {
    void previewOffset;
    void onPreviewChange;
    void onPreviewStart;
    void onPreviewEnd;
  })();

  async function handleRetryClick(e: MouseEvent<HTMLButtonElement>) {
    if (!onRetry) return;
    try {
      setRetrySpinning(true);

      const result: unknown = (() => {
        if (typeof onRetry !== "function") return undefined;
        try {
          if ((onRetry as MouseEventHandler<HTMLButtonElement>).length > 0) {
            return (onRetry as MouseEventHandler<HTMLButtonElement>)(e);
          }
          return (onRetry as () => void)();
        } catch {
          return undefined;
        }
      })();

      if (
        result !== undefined &&
        result !== null &&
        typeof (result as { then?: unknown }).then === "function"
      ) {
        (await result) as Promise<unknown>;
      }
    } finally {
      setRetrySpinning(false);
    }
  }
  return (
    <div className="w-full max-w-3xl mx-auto space-y-12">
      <div className="w-full bg-neutral-800 px-4 py-8 rounded-xl text-center text-neutral-100 space-y-6">
        <div className="w-full flex items-center justify-center">
          {message && /no\s+results?\s+found/i.test(message) ? (
            <motion.div
              className="text-neutral-300"
              style={{ display: "inline-flex" }}
              variants={notFoundBounce}
              initial="hidden"
              animate="visible"
            >
              <CiLocationOff size={56} />
            </motion.div>
          ) : (
            <motion.div
              className="text-neutral-300"
              style={{ display: "inline-flex" }}
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            >
              <MdOutlineDoNotDisturb size={50} />
            </motion.div>
          )}
        </div>
        {(() => {
          const heading =
            message && /no\s+results?\s+found/i.test(message)
              ? "Location not found"
              : "Something went wrong";
          return (
            <h2 className="text-xl lg:text-[52px] font-bold">{heading}</h2>
          );
        })()}
        <p className="text-[28px] text-neutral-200 font-medium">
          {message || "Please try again later."}
        </p>
        {onRetry && (
          <div className="flex justify-center">
            {message && /no\s+results?\s+found/i.test(message) ? (
              <button
                className="px-4 py-3 rounded-lg bg-neutral-700 hover:opacity-80 cursor-pointer font-medium text-base flex items-center gap-2"
                onClick={handleRetryClick}
              >
                <FaArrowLeftLong size={20} />
                Go back
              </button>
            ) : (
              <button
                className="px-4 py-3 rounded-lg bg-neutral-700 hover:opacity-80 cursor-pointer font-medium text-base flex items-center gap-2"
                onClick={handleRetryClick}
              >
                <motion.span
                  style={{ display: "inline-flex" }}
                  initial={{ rotate: 0 }}
                  animate={retrySpinning ? { rotate: 360 } : { rotate: 0 }}
                  transition={
                    retrySpinning
                      ? { repeat: Infinity, duration: 0.9, ease: "linear" }
                      : undefined
                  }
                >
                  <RiLoopRightFill size={20} />
                </motion.span>
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
