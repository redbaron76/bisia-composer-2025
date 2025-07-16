import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";

import {
  OtpSchema,
  UsernamePhoneSchema,
  type PasswordlessAccess,
  type UsernamePhone,
} from "@/schemas/auth";
import { auth } from "@/lib/firebase";
import { doCheckUsername, doPasswordlessIn } from "@/apis/auth";

import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import type { ApiResponse, User } from "@/types/auth";
import { useAppForm } from "./demo.form";

type FirebaseOptions = {
  onError?: ({ error, message }: ApiResponse) => void;
  onSuccess?: (userAuth: User, accessToken: string, message?: string) => void;
};

// Helper function to convert SignupUser to User
const convertSignupUserToUser = (signupUser: any): User => {
  return {
    id: signupUser.id,
    refId: signupUser.refId,
    username: signupUser.username,
    slug: signupUser.slug,
    phone: signupUser.phone,
    email: signupUser.email,
    role: signupUser.role,
    isDisabled: false, // Default value since SignupUser doesn't have this
    created: new Date().toISOString(), // Default value since SignupUser doesn't have this
    updated: new Date().toISOString(), // Default value since SignupUser doesn't have this
  };
};

export function useFirebase({ onError, onSuccess }: FirebaseOptions) {
  const signupCredentialsRef = useRef<UsernamePhone | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const [isSigningIn, setIsSigningIn] = useState(false);

  const { mutateAsync: checkUser, isPending: isCheckingUser } = useMutation({
    mutationFn: (data: UsernamePhone) => doCheckUsername(data),
  });

  const { mutateAsync: signupUser, isPending: signupLoading } = useMutation({
    mutationFn: (data: PasswordlessAccess) => doPasswordlessIn(data),
  });

  // Metodo per creare il RecaptchaVerifier
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

  const phoneSignIn = async ({ username, phone }: UsernamePhone) => {
    setIsSigningIn(true);
    phone = phone.replace(/\s/g, "");

    // check if username and phone are already in use
    const { error, message } = await checkUser({ username, phone });
    if (error) {
      onError?.({ error, message });
      setIsSigningIn(false);
      return;
    }

    if (!error) {
      // inizializza il recaptcha
      const recaptchaVerifier = createRecaptchaVerifier();
      // resetta l'errore del form
      onError?.({ error: false, message: "" });

      signInWithPhoneNumber(auth, phone, recaptchaVerifier)
        .then((confirmation) => {
          setConfirmationResult(confirmation);
        })
        .catch((error) => {
          onError?.({ error: true, message: error.message });
          window.grecaptcha.reset(window.recaptchaWidgetId);
        })
        .finally(() => {
          // salva le credenziali di signup per il recupero in caso di errore
          signupCredentialsRef.current = { username, phone };
          // rimuovi il recaptcha
          recaptchaVerifier.clear();
          window.recaptchaVerifierInstance = undefined;
          window.recaptchaWidgetId = undefined;

          // resetta il form
          formPhone.reset();

          // resetta lo stato di signing in
          setIsSigningIn(false);
        });
    }
  };

  const sendConfirmationCode = (code: string) => {
    setIsSigningIn(true);

    if (confirmationResult && signupCredentialsRef.current) {
      const { username, phone } = signupCredentialsRef.current;

      confirmationResult
        .confirm(code)
        .then(async (result) => {
          const fbUser = result.user;
          const refId = fbUser.uid;

          const response = await signupUser({
            username,
            phone,
            refId,
            provider: "firebase",
          });

          // response from doPhoneIn (/auth/phone-access)
          const { user, accessToken, message } = response;
          const convertedUser = convertSignupUserToUser(user);

          // rimuovi le credenziali di signup
          signupCredentialsRef.current = null;
          // rimuovi il confirmation result
          setConfirmationResult(null);
          // resetta lo stato di signing in
          setIsSigningIn(false);
          // chiama la funzione di successo
          onSuccess?.(convertedUser, accessToken, message);
        })
        .catch((error) => {
          console.log("OTP error", error);
          if (error)
            onError?.({
              error: true,
              message: "Il codice OTP inserito non è valido",
            });
        })
        .finally(() => {
          // resetta il form
          formOtp.reset();
          setIsSigningIn(false);
          window.grecaptcha.reset(window.recaptchaWidgetId);
        });
    }
  };

  const formPhone = useAppForm({
    defaultValues: {
      username: "",
      phone: "",
    },
    validators: {
      onBlur: UsernamePhoneSchema,
    },
    onSubmit: ({ value }) => {
      phoneSignIn(value);
    },
  });

  const formOtp = useAppForm({
    defaultValues: {
      otp: "",
    },
    validators: {
      onBlur: OtpSchema,
    },
    onSubmit: ({ value }) => {
      sendConfirmationCode(value.otp);
    },
  });

  return {
    phoneSignIn,
    sendConfirmationCode,
    isSigningIn: isSigningIn || isCheckingUser || signupLoading,
    confirmationResult,
    formPhone,
    formOtp,
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
