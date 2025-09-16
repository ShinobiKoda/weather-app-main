"use client";

import { MouseEventHandler } from "react";

type APIErrorProps = {
  message?: string;
  onRetry?: MouseEventHandler<HTMLButtonElement> | (() => void);
};

export function APIError({ message, onRetry }: APIErrorProps) {
  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-neutral-800 rounded-xl text-center text-neutral-100">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-neutral-300 mb-4">
        {message || "Please try again later."}
      </p>
      {onRetry && (
        <div className="flex justify-center">
          <button
            className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-600"
            onClick={onRetry as MouseEventHandler<HTMLButtonElement>}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
