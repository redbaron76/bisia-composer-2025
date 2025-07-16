import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HTTPException } from "hono/http-exception";
import { env } from "@/env";

type ErrorResponse = {
  error: boolean;
  message: string;
  status?: number;
};

type AuthApiOptions = {
  origin: string;
} & RequestInit;

export const callAuthApi = async <TResponse>(
  endpoint: string,
  body: any,
  options: AuthApiOptions
): Promise<TResponse> => {
  try {
    const response = await fetch(`${env.AUTH_API_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: options.origin,
      },
      body: JSON.stringify(body),
      ...options,
    });

    const data = (await response.json()) as ErrorResponse;

    if (!response.ok || data.error) {
      throw new HTTPException(response.status as ContentfulStatusCode, {
        message: data.message || "Errore nella comunicazione con Auth-API",
      });
    }

    return data as TResponse;
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    // Gestione errori di rete o parsing JSON
    throw new HTTPException(500, {
      message: "Errore nella comunicazione con Auth-API",
    });
  }
};
