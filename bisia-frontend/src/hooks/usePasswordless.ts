import {
  OtpSchema,
  UsernameEmailOrPhoneSchema,
  type PasswordlessAccess,
  type UsernameEmail,
  type UsernameEmailOrPhone,
} from "@/schemas/auth";

import {
  doCheckUsername,
  doPasswordlessIn,
  doSendOtpWithEmail,
  doSignUpWithEmail,
} from "@/apis/auth";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import type { ApiResponse, OtpConfirmation, User } from "@/types/auth";
import { useAppForm } from "@/hooks/demo.form";
import { useFirebaseAuthPhone } from "@/hooks/useFirebaseAuthPhone";
import type { User as FirebaseUser } from "firebase/auth";
import { useAuthStore } from "@/stores/AuthStore";

type PasswordlessOptions = {
  onError?: ({ error, message }: ApiResponse) => void;
  onSuccess?: (userAuth: User, accessToken: string, message?: string) => void;
};

export function usePasswordless({ onError, onSuccess }: PasswordlessOptions) {
  const {
    confirmationResult,
    setConfirmationResult,
    signUpWithPhone,
    sendOtpWithPhone,
  } = useFirebaseAuthPhone();

  const signupCredentialsRef = useRef<UsernameEmailOrPhone | null>(null);
  const [confirmOtp, setConfirmOtp] = useState<boolean>(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [otpExp, setOtpExp] = useState<number>();

  const resetMessage = useAuthStore((state) => state.resetMessage);

  useEffect(() => {
    setConfirmOtp(!!confirmationResult);
  }, [confirmationResult]);

  useEffect(() => {
    resetMessage();
  }, [confirmOtp]);

  const { mutateAsync: checkUser, isPending: isCheckingUser } = useMutation({
    mutationFn: (data: UsernameEmailOrPhone) => doCheckUsername(data),
  });

  const { mutateAsync: signupUser, isPending: signupLoading } = useMutation({
    mutationFn: (data: PasswordlessAccess) => doPasswordlessIn(data),
  });

  const { mutateAsync: signUpWithEmail, isPending: emailLoading } = useMutation(
    {
      mutationFn: (data: UsernameEmail) => doSignUpWithEmail(data),
    }
  );

  const { mutateAsync: sendOtpWithEmail, isPending: otpLoading } = useMutation({
    mutationFn: (data: OtpConfirmation) => doSendOtpWithEmail(data),
  });

  const passwordlessSignIn = async ({
    username,
    email,
    phone,
  }: UsernameEmailOrPhone) => {
    setIsSigningIn(true);
    email = email?.replace(/\s/g, "");
    phone = phone?.replace(/\s/g, "");

    const isPhone = !!phone;

    try {
      // check if username and phone are already in use
      await checkUser({ username, email, phone });

      // Se arriviamo qui, non ci sono errori
      if (isPhone && phone) {
        // For phone, use Firebase authentication
        await signUpWithPhone(phone);
        setConfirmOtp(true);
      } else if (email) {
        const otpExp = await signUpWithEmail({ username, email });

        setOtpExp(otpExp);
        setConfirmOtp(true);
      }

      // save the credentials for the signup
      signupCredentialsRef.current = { username, email, phone };

      // reset the form only on success
      formPasswordless.reset();
    } catch (error) {
      // Don't reset the form on error, keep the current form visible
      // Also reset OTP state to ensure we stay on the main form
      setConfirmOtp(false);
      setOtpExp(undefined);
      setConfirmationResult(null);

      if (error instanceof Error) {
        onError?.({ error: true, message: error.message });
      } else {
        onError?.({
          error: true,
          message: "Errore nel login con email o telefono",
        });
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const otpConfirmation = async (code: string) => {
    setIsSigningIn(true);

    if (confirmOtp && signupCredentialsRef.current) {
      const { username, phone, email } = signupCredentialsRef.current;
      const isPhone = !!phone;
      const isEmail = !!email;

      try {
        // send the OTP to the phone or email
        let authUser = null;
        let userId = undefined;
        let refId = undefined;
        let provider: "email" | "firebase" = "email";

        if (isPhone) {
          // For phone, use Firebase authentication
          authUser = await sendOtpWithPhone(code);
          if (authUser) {
            refId = (authUser as FirebaseUser).uid;
            provider = "firebase";
          }
        }
        if (isEmail) {
          // For email, we use our OTP system
          const otpResponse = await sendOtpWithEmail({
            otp: code,
            email,
            username,
          });
          if (!otpResponse.error) {
            userId = otpResponse.userId;
            provider = "email";
          }
        }

        if (authUser || userId) {
          const response = await signupUser({
            userId,
            username,
            phone,
            email,
            refId,
            provider,
          });

          const { user, accessToken, message } = response;
          const convertedUser = user;

          onSuccess?.(convertedUser, accessToken, message);

          // reset the form
          formOtp.reset();
          // reset credentials
          signupCredentialsRef.current = null;
          // reset the confirmation result
          setConfirmationResult(null);
          // reset the confirmation state
          setConfirmOtp(false);
          // reset the otp expiration
          setOtpExp(undefined);
        }
      } catch (error) {
        if (error instanceof Error) {
          onError?.({ error: true, message: error.message });
        } else {
          onError?.({ error: true, message: "Errore nel login con telefono" });
        }
      } finally {
        // reset the signing in state
        setIsSigningIn(false);
      }
    }
  };

  const formPasswordless = useAppForm({
    defaultValues: {
      username: "",
      email: "",
      phone: "",
    } as UsernameEmailOrPhone,
    validators: {
      onBlur: UsernameEmailOrPhoneSchema,
    },
    onSubmit: ({ value }) => {
      passwordlessSignIn(value as UsernameEmailOrPhone);
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
      otpConfirmation(value.otp);
    },
  });

  return {
    confirmOtp,
    formPasswordless,
    formOtp,
    otpExp,
    isSigningIn:
      isSigningIn ||
      isCheckingUser ||
      signupLoading ||
      emailLoading ||
      otpLoading,
  };
}
