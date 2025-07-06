import { env } from "@/env";

type FetcherOptions = RequestInit & {
  origin?: string;
  body?: any;
  throwOnError?: boolean; // se true, lancia eccezione su errori HTTP, altrimenti restituisce la risposta
};

export const fetcher = async <TResponse>(
  url: string,
  options: FetcherOptions = {}
): Promise<TResponse> => {
  const { origin, body, throwOnError = true, ...rest } = options;

  // Gestisce sia URL completi che path relativi
  const fullUrl = url.startsWith("http") ? url : `${env.AUTH_BASE_URL}${url}`;

  const response = await fetch(fullUrl, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Origin: origin || env.AUTH_BASE_URL,
      ...rest.headers, // Preserva headers personalizzati
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok && throwOnError) {
    throw new Error(
      `HTTP error! ${url} status: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<TResponse>;
};

export const postFetcher = async <TResponse>(
  url: string,
  body: any,
  options: FetcherOptions = {}
): Promise<TResponse> => {
  return await fetcher(url, {
    method: "POST",
    ...options,
    body,
  });
};

export const getFetcher = async <TResponse>(
  url: string,
  options: FetcherOptions = {}
): Promise<TResponse> => {
  return await fetcher(url, {
    method: "GET",
    ...options,
  });
};

export const deleteFetcher = async <TResponse>(
  url: string,
  options: FetcherOptions = {}
): Promise<TResponse> => {
  return await fetcher(url, {
    method: "DELETE",
    ...options,
  });
};

export const putFetcher = async <TResponse>(
  url: string,
  body: any,
  options: FetcherOptions = {}
): Promise<TResponse> => {
  return await fetcher(url, {
    method: "PUT",
    ...options,
    body,
  });
};

// Metodo per ottenere la risposta completa senza parsing JSON
export const fetcherRaw = async (
  url: string,
  options: FetcherOptions = {}
): Promise<Response> => {
  const { origin, body, ...rest } = options;

  const fullUrl = url.startsWith("http") ? url : `${env.AUTH_BASE_URL}${url}`;

  return await fetch(fullUrl, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Origin: origin || env.AUTH_BASE_URL,
      ...rest.headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
};
