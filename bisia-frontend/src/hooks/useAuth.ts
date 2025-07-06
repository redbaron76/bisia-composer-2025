import {
  doDeleteUser,
  doLogin,
  doLogout,
  doPhoneIn,
  doProtected,
} from "@/apis/auth";

import { useAuthStore } from "@/stores/AuthStore";
import { useMutation } from "@tanstack/react-query";

export const useAuth = () => {
  const logoutMutation = useMutation({
    mutationFn: doLogout,
    onSuccess: (data) => {
      useAuthStore.setState({
        accessToken: "",
        userAuth: null,
        isAuthenticated: false,
        error: undefined,
        message: data.success
          ? "Logout effettuato con successo"
          : "Logout fallito",
      });
    },
  });

  const loginMutation = useMutation({
    mutationFn: doLogin,
    onSuccess: (data) => {
      useAuthStore.setState({
        accessToken: data.accessToken,
        userAuth: data.user,
        isAuthenticated: true,
        error: undefined,
        message: "Login effettuato con successo",
      });
    },
    onError: (error) => {
      useAuthStore.setState({
        error: error.message,
        message: undefined,
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
        error: data.success
          ? undefined
          : "Errore durante l'eliminazione dell'utente",
        message: data.success ? "Utente eliminato con successo" : undefined,
      });
    },
  });

  const loginPhoneMutation = useMutation({
    mutationFn: doPhoneIn,
    onSuccess: (data) => {
      useAuthStore.setState({
        accessToken: data.accessToken,
        userAuth: data.user,
        isAuthenticated: true,
      });
    },
    onError: (error) => {
      useAuthStore.setState({
        error: error.message,
        message: undefined,
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
        error: error.message,
        message: undefined,
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
