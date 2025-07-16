/**
 * Centralized error messages for the bisia-api
 * This file contains all error messages used throughout the application
 * to ensure consistency and easy maintenance
 */

export const ERROR_MESSAGES = {
  // Origin errors
  MISSING_ORIGIN: {
    SIGNUP: "Origin mancante nella chiamata: /signup",
    EMAIL_SIGNUP: "Origin mancante nella chiamata: /email-signup",
    OTP_CONFIRMATION: "Origin mancante nella chiamata: /otp-confirmation",
    PASSWORDLESS: "Origin mancante nella chiamata: /passwordless",
    LOGIN: "Origin mancante nella chiamata: /login",
    REFRESH: "Origin mancante nella chiamata: /refresh",
    LOGOUT: "Origin mancante nella chiamata: /logout",
    CHECK_USERNAME: "Origin mancante nel check-username",
    DELETE_USER: "Origin mancante nel delete-user",
    CONFIRM_OTP: "Origin mancante nel confirm-otp",
  },

  // Server errors
  SERVER: {
    CONFIRM_OTP_ERROR: "Errore nel confirm-otp",
  },
} as const;

/**
 * Helper function to get error message by key
 * @param category - The error category
 * @param key - The error key
 * @returns The error message
 */
export const getErrorMessage = (
  category: keyof typeof ERROR_MESSAGES,
  key: string
): string => {
  const categoryMessages = ERROR_MESSAGES[category] as Record<string, string>;
  return categoryMessages[key] || "Errore sconosciuto";
};
