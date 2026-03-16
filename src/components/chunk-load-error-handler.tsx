"use client";

import { useEffect } from "react";

const CHUNK_ERROR_REFRESH_KEY = "chunk-error-refreshed";

function isChunkLoadError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.name === "ChunkLoadError" ||
      (error.message?.includes("Loading chunk") ?? false) ||
      (error.message?.includes("Failed to fetch dynamically imported module") ??
        false)
    );
  }
  return false;
}

export function ChunkLoadErrorHandler({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error ?? event.message;
      if (!isChunkLoadError(error)) return;

      const alreadyRefreshed = sessionStorage.getItem(CHUNK_ERROR_REFRESH_KEY);
      if (alreadyRefreshed === "true") {
        sessionStorage.removeItem(CHUNK_ERROR_REFRESH_KEY);
        return;
      }

      sessionStorage.setItem(CHUNK_ERROR_REFRESH_KEY, "true");
      window.location.reload();
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      if (!isChunkLoadError(error)) return;

      const alreadyRefreshed = sessionStorage.getItem(CHUNK_ERROR_REFRESH_KEY);
      if (alreadyRefreshed === "true") {
        sessionStorage.removeItem(CHUNK_ERROR_REFRESH_KEY);
        return;
      }

      sessionStorage.setItem(CHUNK_ERROR_REFRESH_KEY, "true");
      window.location.reload();
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return <>{children}</>;
}
