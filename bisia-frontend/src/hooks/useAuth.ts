import {
  doDeleteUser,
  doLogin,
  doLogout,
  doPasswordlessIn,
  doProtected,
} from "@/apis/auth";

import type { User } from "@/types/auth";
import { useAuthStore } from "@/stores/AuthStore";
import { useMutation } from "@tanstack/react-query";

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

export const useAuth = () => {
  const logoutMutation = useMutation({
    mutationFn: doLogout,
    onSuccess: (data) => {
      useAuthStore.setState({
        accessToken: "",
        userAuth: null,
        isAuthenticated: false,
        error: undefined,
        message: !data.error
          ? "Logout effettuato con successo"
          : "Logout fallito",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: doLogin,
    onSuccess: (data) => {
      console.log("loginMutation onSuccess data", data);
      const convertedUser = convertSignupUserToUser(data.user);
      useAuthStore.setState({
        accessToken: data.accessToken,
        userAuth: convertedUser,
        isAuthenticated: true,
        error: undefined,
        message: "Login effettuato con successo",
      });
    },
    onError: (error) => {
      console.log("loginMutation onError error", error);
      useAuthStore.setState({
        error: true,
        message: error.message,
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: doDeleteUser,
    onSuccess: (data) => {
      useAuthStore.setState({
        accessToken: "",
        userAuth: null,
        isAuthenticated: false,
        error: data.success ? undefined : true,
        message: data.success
          ? "Utente eliminato con successo"
          : "Errore durante l'eliminazione dell'utente",
      });
    },
  });

  const loginPhoneMutation = useMutation({
    mutationFn: doPasswordlessIn,
    onSuccess: (data) => {
      const convertedUser = convertSignupUserToUser(data.user);
      useAuthStore.setState({
        accessToken: data.accessToken,
        userAuth: convertedUser,
        isAuthenticated: true,
      });
    },
    onError: (error) => {
      useAuthStore.setState({
        error: true,
        message: error.message,
      });
    },
  });

  const protectedMutation = useMutation({
    mutationFn: doProtected,
    onSuccess: (data) => {
      console.log("protectedMutation data", data);
      useAuthStore.setState({
        error: undefined,
        message: data.message,
      });
    },
    onError: (error) => {
      useAuthStore.setState({
        error: true,
        message: error.message,
      });
    },
  });

  return {
    logoutMutation,
    loginMutation,
    loginPhoneMutation,
    protectedMutation,
    deleteUserMutation,
  };
};
