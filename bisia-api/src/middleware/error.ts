import type { Context, ErrorHandler } from "hono";

import { HTTPException } from "hono/http-exception";

export const handleException: ErrorHandler = (
  err: Error | HTTPException,
  c: Context
) => {
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: true,
        message: err.message,
        status: err.status,
      },
      err.status
    );
  }

  console.error("Bisia API handleException:", err); // Log per debugging

  return c.json(
    {
      error: true,
      message: "Errore interno del backend",
    },
    500
  );
};
