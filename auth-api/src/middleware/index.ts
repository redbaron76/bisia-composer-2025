import { getAppOptions } from "@/db/api";
import type { AppOptions } from "@/types";

import { type Context, type Next } from "hono";

/**
 * Inizializza l'app e restituisce le opzioni per ogni app
 * @returns {Object} - Un oggetto contenente l'array degli appId e il map delle opzioni per ogni app
 */
export const initApp = async () => {
  const appOptions = await getAppOptions();

  // creo un array di appId
  const allowedOrigins = appOptions.map(({ appId }) => appId);

  // creo un map di appId e revocable
  const appOptionsMap = new Map<string, AppOptions>();
  appOptions.forEach(
    ({ appId, revocable, accessTokenMinutesExp, refreshTokenDaysExp }) => {
      appOptionsMap.set(appId, {
        revocable: revocable ?? false,
        accessTokenMinutesExp: accessTokenMinutesExp ?? 0,
        refreshTokenDaysExp: refreshTokenDaysExp ?? 0,
      });
    }
  );

  return {
    allowedOrigins,
    appOptionsMap,
  };
};

/**
 * Middleware per settare le opzioni dell'app
 * @param {Map<string, AppOptions>} appOptionsMap - Un map delle opzioni per ogni app
 * @returns {Function} - Un middleware per Hono
 */
export const optionsMiddleware = (appOptionsMap: Map<string, AppOptions>) => {
  return async (c: Context, next: Next) => {
    const origin = c.req.header("Origin");
    if (origin) {
      const appOptions = appOptionsMap.get(origin);
      if (appOptions) {
        c.set("revocable", appOptions.revocable);
        c.set("accessTokenMinutesExp", appOptions.accessTokenMinutesExp);
        c.set("refreshTokenDaysExp", appOptions.refreshTokenDaysExp);
      }
    }
    await next();
  };
};
