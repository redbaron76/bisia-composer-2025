import { auth } from "@/lib/firebase";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

import { useCallback, useState } from "react";

export function useFirebaseAuthPhone() {
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const createRecaptchaVerifier = (): RecaptchaVerifier => {
    // Crea il recaptcha solo se non esiste già
    if (!window.recaptchaVerifierInstance) {
      const recaptchaVerifier = new RecaptchaVerifier(auth, "signup-button", {
        size: "invisible",
        callback: (_response: unknown) => {
          console.log("reCAPTCHA solved, allow signInWithPhoneNumber.");
        },
      });
      window.recaptchaVerifierInstance = recaptchaVerifier;
      // Salva l'id del widget
      recaptchaVerifier.render().then((id) => {
        window.recaptchaWidgetId = id;
      });
      return recaptchaVerifier;
    } else {
      return window.recaptchaVerifierInstance;
    }
  };

  /**
   * Request a phone number verification (OTP) and save the confirmation result
   * @param phone - The phone number to sign up with
   * @returns The confirmation result
   */
  const signUpWithPhone = useCallback(async (phone: string) => {
    const recaptchaVerifier = createRecaptchaVerifier();

    try {
      // perform the sign in with phone number
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifier
      );
      // save the confirmation result
      setConfirmationResult(result);
    } catch (error) {
      console.error(error);
      throw new Error("Errore durante il login con telefono");
      // reset the recaptcha verifier
      window.grecaptcha.reset(window.recaptchaWidgetId);
    } finally {
      // reset the recaptcha verifier
      recaptchaVerifier.clear();
      window.recaptchaVerifierInstance = undefined;
      window.recaptchaWidgetId = undefined;
    }
  }, []);

  /**
   * Send an OTP to the phone number and confirm the sign up
   * @param code - The OTP code to confirm the sign up
   * @returns The user object if the sign up is successful, null otherwise
   */
  const sendOtpWithPhone = useCallback(
    async (code: string) => {
      if (confirmationResult) {
        try {
          const result = await confirmationResult.confirm(code);
          return result.user;
        } catch (error) {
          console.error("Error sending OTP", error);
          throw new Error("Il codice OTP inserito non è valido");
        } finally {
          window.grecaptcha.reset(window.recaptchaWidgetId);
        }
      }
      return null;
    },
    [confirmationResult]
  ); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    confirmationResult,
    setConfirmationResult,
    signUpWithPhone,
    sendOtpWithPhone,
  };
}

// Aggiungi questa dichiarazione globale per evitare errori TypeScript
// Puoi spostarla in global.d.ts se preferisci

declare global {
  interface Window {
    recaptchaVerifierInstance?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
    grecaptcha?: any;
  }
}
