import type { RefreshToken } from "@/types/auth";
import { env } from "@/env";
import { sleep } from "@/lib/utils";
import { useAuthStore } from "../stores/AuthStore";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  sleepSeconds?: number;
  responseType?: "json" | "text";
  credentials?: RequestCredentials;
  errorFallbackMessage?: string;
}

/**
 * Riautentica la richiesta se il token è scaduto
 * @param response - La risposta della richiesta
 * @returns La risposta della richiesta
 */
const reAuthorizeRequest = async (response: Response): Promise<any> => {
  const refreshResponse = await postFetcher<RefreshToken>(
    `${env.VITE_API_URL}/auth/refresh`,
    {},
    {
      credentials: "include",
    }
  );

  if (!refreshResponse.accessToken) {
    throw new Error("Token refresh failed");
  }

  useAuthStore.setState({
    accessToken: refreshResponse.accessToken,
    isAuthenticated: true,
  });

  const options: FetchOptions = {
    ...response,
    headers: {
      ...response.headers,
      Authorization: `Bearer ${refreshResponse.accessToken}`,
    },
    credentials: "include",
  };

  const newResponse = await fetch(response.url, options);

  return await handleResponse(newResponse, options);
};

/**
 * Gestisce la risposta della richiesta
 * @param response - La risposta della richiesta
 * @returns La risposta della richiesta
 */
const handleResponse = async (
  response: Response,
  options: FetchOptions = {}
) => {
  try {
    const isJson =
      options.responseType === "json" ||
      response.headers.get("content-type")?.includes("application/json");
    const resp = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      switch (response.status) {
        case 401:
          return await reAuthorizeRequest(response);
        case 400:
        case 500:
        case 404:
          if (typeof resp === "object" && resp.error === true && resp.message) {
            throw new Error(resp.message);
          } else if (typeof resp === "string") {
            throw new Error(resp);
          } else {
            throw new Error(response.statusText);
          }
        default:
          throw new Error(response.statusText);
      }
    }

    // Gestione automatica errori API su tutte le risposte
    if (typeof resp === "object" && resp.error === true) {
      throw new Error(
        resp.message || options.errorFallbackMessage || "Errore API"
      );
    }

    return resp;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Errore nella gestione della risposta");
  }
};

/**
 * Esegue una richiesta HTTP
 * @param url - L'URL della richiesta
 * @param options - Le opzioni della richiesta
 * @returns La risposta della richiesta
 */
export const fetcher = async (
  url: string,
  options: FetchOptions = {}
): Promise<Response> => {
  const { skipAuth, sleepSeconds, responseType, credentials, ...fetchOptions } =
    options;
  const accessToken = useAuthStore.getState().accessToken;

  if (sleepSeconds) {
    await sleep(sleepSeconds);
  }

  const headers = {
    ...fetchOptions.headers,
    ...(accessToken && !skipAuth
      ? { Authorization: `Bearer ${accessToken}` }
      : {}),
  };

  return await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });
};

export const postFetcher = async <TResponse>(
  url: string,
  body: any,
  options: FetchOptions = {}
): Promise<TResponse> => {
  const { responseType, ...fetchOptions } = options;

  const response = await fetcher(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...fetchOptions,
  });

  return (await handleResponse(response, {
    ...options,
  })) as TResponse;
};

export const getFetcher = async <TResponse>(
  url: string,
  options: FetchOptions = {}
): Promise<TResponse> => {
  const response = await fetcher(url, {
    method: "GET",
    ...options,
  });

  return (await handleResponse(response, {
    ...options,
  })) as TResponse;
};

export const putFetcher = async <TResponse>(
  url: string,
  body: any,
  options: FetchOptions = {}
): Promise<TResponse> => {
  const { responseType, ...fetchOptions } = options;

  const response = await fetcher(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
    ...fetchOptions,
  });

  return (await handleResponse(response, {
    ...options,
  })) as TResponse;
};

export const deleteFetcher = async <TResponse>(
  url: string,
  options: FetchOptions = {}
): Promise<TResponse> => {
  const response = await fetcher(url, {
    method: "DELETE",
    ...options,
  });

  return (await handleResponse(response, {
    ...options,
  })) as TResponse;
};
