"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      void fetch("/api/errors/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          digest: error.digest,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          extra: { type: "global-error" },
        }),
        keepalive: true,
      });
    } catch {
      /* ignore */
    }
  }, [error]);

  return (
    <html lang="es-CL">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 24 }}>
        <h1 style={{ fontSize: 20, marginBottom: 8 }}>Error en la aplicación</h1>
        <p style={{ color: "#555", marginBottom: 16 }}>
          Se registró el fallo para revisión. Puedes reintentar cargar la página.
        </p>
        <pre
          style={{
            background: "#f6f8fa",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {error.message}
        </pre>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: 16,
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#0870EF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
