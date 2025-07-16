/**
 * Centralized error messages for the auth-api
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
    CHECK_USERNAME: "Origin mancante nella chiamata: /check-username",
    DELETE_USER: "Origin mancante nella chiamata: /delete-user",
    CONFIRM_OTP: "Origin mancante nella chiamata: /confirm-otp",
  },

  // Validation errors
  VALIDATION: {
    EMAIL_OR_USERNAME_REQUIRED: "Email o username sono obbligatori",
    PASSWORD_REQUIRED: "Password è obbligatoria",
    EMAIL_REQUIRED: "Email è obbligatoria",
    USERNAME_AND_EMAIL_REQUIRED: "Username e email sono obbligatori",
    USERNAME_AND_PHONE_REQUIRED:
      "Username e numero di telefono sono obbligatori",
    EMAIL_AND_PASSWORD_REQUIRED: "Email e password sono obbligatori",
    EMAIL_REQUIRED_OTP: "Indirizzo email è obbligatorio",
  },

  // Authorization errors
  AUTHORIZATION: {
    APP_NOT_AUTHORIZED: "Applicazione non autorizzata",
    INVALID_CREDENTIALS: "Credenziali non valide",
    USER_NOT_FOUND: "Utente non trovato",
    INVALID_REFRESH_TOKEN: "Refresh token non valido o scaduto",
    INVALID_REFRESH_TOKEN_APP:
      "Refresh token non valido per questa applicazione",
  },

  // Conflict errors
  CONFLICT: {
    USERNAME_ALREADY_IN_USE: "Username già in uso",
    USERNAME_ALREADY_IN_USE_OTHER_ACCOUNT:
      "Username già in uso con un altro account",
    USER_ALREADY_REGISTERED: "Utente già registrato",
    PHONE_ALREADY_IN_USE: "Numero di telefono già in uso con un altro account",
    EMAIL_ALREADY_IN_USE: "Indirizzo E-mail già in uso con un altro account",
    PHONE_NOT_CORRECT: "Il numero di telefono non sembra essere corretto",
    EMAIL_NOT_CORRECT: "L'indirizzo email non sembra essere corretto",
  },

  // OTP errors
  OTP: {
    INVALID_OTP: "Codice OTP non valido",
    EXPIRED_OTP: "Codice OTP scaduto",
  },

  // Server errors
  SERVER: {
    INTERNAL_ERROR: "Errore interno del backend",
    USER_DELETION_ERROR: "Errore durante la cancellazione dell'utente",
    CONFIRM_OTP_ERROR: "Errore nel confirm-otp",
  },

  // Success messages
  SUCCESS: {
    REGISTRATION: "Registrazione effettuata con successo",
    LOGIN: "Accesso effettuato con successo",
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

/**
 * Helper function to get error message with fallback
 * @param category - The error category
 * @param key - The error key
 * @param fallback - The fallback message
 * @returns The error message or fallback
 */
export const getErrorMessageWithFallback = (
  category: keyof typeof ERROR_MESSAGES,
  key: string,
  fallback: string
): string => {
  const message = getErrorMessage(category, key);
  return message !== "Errore sconosciuto" ? message : fallback;
};
