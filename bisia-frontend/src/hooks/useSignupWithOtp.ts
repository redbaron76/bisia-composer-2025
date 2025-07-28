import {
  doCheckUsername,
  doPasswordSignup,
  doPasswordSignupConfirmation,
} from "@/apis/auth";
import { useRef, useState } from "react";

import type { OtpConfirmation } from "@/types/auth";
import { OtpSchema, SignupSchema, type SignupData } from "@/schemas/auth";
import { useAppForm } from "@/hooks/demo.form";
import { useAuthStore } from "@/stores/AuthStore";
import { useMutation } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { useNavigate } from "@tanstack/react-router";

export function useSignupWithOtp() {
  const signupCredentialsRef = useRef<SignupData | null>(null);
  const [confirmOtp, setConfirmOtp] = useState<boolean>(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [otpExp, setOtpExp] = useState<number>();
  const navigate = useNavigate();

  const { resetMessage, setMessage, setUserAuth } = useAuthStore(
    useShallow((state) => ({
      resetMessage: state.resetMessage,
      setMessage: state.setMessage,
      setUserAuth: state.setUserAuth,
    }))
  );

  const { mutateAsync: checkUser, isPending: isCheckingUser } = useMutation({
    mutationFn: (data: { username: string; email: string }) =>
      doCheckUsername({ ...data, provider: "password" }),
  });

  const { mutateAsync: passwordSignup, isPending: signupLoading } = useMutation(
    {
      mutationFn: (data: {
        username: string;
        email: string;
        password: string;
      }) => doPasswordSignup(data),
    }
  );

  const {
    mutateAsync: passwordSignupConfirmation,
    isPending: confirmationLoading,
  } = useMutation({
    mutationFn: (data: { otp: string; email: string; username: string }) =>
      doPasswordSignupConfirmation(data),
  });

  const signupWithPassword = async (data: SignupData) => {
    setIsSigningUp(true);
    const email = data.email.replace(/\s/g, "");

    try {
      // Check if username and email are already in use
      await checkUser({ username: data.name, email });

      // If we get here, no errors occurred
      const otpExp = await passwordSignup({
        username: data.name,
        email,
        password: data.password,
      });
      setOtpExp(otpExp);
      setConfirmOtp(true);
      resetMessage();

      // Save the credentials for the signup
      signupCredentialsRef.current = data;

      // Reset the form only on success
      formSignup.reset();
    } catch (error) {
      // Don't reset the form on error, keep the current form visible
      // Also reset OTP state to ensure we stay on the main form
      setConfirmOtp(false);
      setOtpExp(undefined);

      if (error instanceof Error) {
        setMessage(true, error.message);
      } else {
        setMessage(true, "Errore durante la registrazione");
      }
    } finally {
      setIsSigningUp(false);
    }
  };

  const otpConfirmation = async (code: string) => {
    setIsSigningUp(true);

    if (confirmOtp && signupCredentialsRef.current) {
      const { name, email } = signupCredentialsRef.current;

      try {
        // Confirm the OTP for password signup
        const response = await passwordSignupConfirmation({
          otp: code,
          email,
          username: name,
        });

        const { user, accessToken, message } = response;
        setUserAuth(user, accessToken, message);

        // Reset the form
        formOtp.reset();
        // Reset credentials
        signupCredentialsRef.current = null;
        // Reset the confirmation state
        setConfirmOtp(false);
        // Reset the otp expiration
        setOtpExp(undefined);

        // Navigate to login page after successful signup
        navigate({ to: "/demo/form/login" });
      } catch (error) {
        if (error instanceof Error) {
          setMessage(true, error.message);
        } else {
          setMessage(true, "Errore durante la conferma OTP");
        }
      } finally {
        // Reset the signing up state
        setIsSigningUp(false);
      }
    }
  };

  const formSignup = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validators: {
      onBlur: SignupSchema,
    },
    onSubmit: ({ value }) => {
      signupWithPassword(value);
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
    formSignup,
    formOtp,
    otpExp,
    isSigningUp:
      isSigningUp || isCheckingUser || signupLoading || confirmationLoading,
  };
}
