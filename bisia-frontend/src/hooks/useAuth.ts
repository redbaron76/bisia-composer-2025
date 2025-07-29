import {
  doDeleteUser,
  doLogin,
  doLogout,
  doPasswordlessIn,
  doProtected,
} from "@/apis/auth";

import { useAuthStore } from "@/stores/AuthStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAuth = () => {
  const logoutMutation = useMutation({
    mutationFn: doLogout,
    onSuccess: (data) => {
      const message = !data.error
        ? "Logout effettuato con successo"
        : "Logout fallito";
      
      useAuthStore.setState({
        accessToken: "",
        userAuth: null,
        isAuthenticated: false,
        error: undefined,
        message,
      });

      if (!data.error) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    },
  });

  const loginMutation = useMutation({
    mutationFn: doLogin,
    onSuccess: (data) => {
      const message = "Login effettuato con successo";
      useAuthStore.setState({
        accessToken: data.accessToken,
        userAuth: data.user,
        isAuthenticated: true,
        error: undefined,
        message,
      });
      toast.success(message);
    },
    onError: (error) => {
      useAuthStore.setState({
        error: true,
        message: error.message,
      });
      toast.error(error.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: doDeleteUser,
    onSuccess: (data) => {
      const message = data.success
        ? "Utente eliminato con successo"
        : "Errore durante l'eliminazione dell'utente";
        
      useAuthStore.setState({
        accessToken: "",
        userAuth: null,
        isAuthenticated: false,
        error: data.success ? undefined : true,
        message,
      });

      if (data.success) {
        toast.success(message);
      } else {
        toast.error(message);
      }
    },
  });

  const loginPhoneMutation = useMutation({
    mutationFn: doPasswordlessIn,
    onSuccess: (data) => {
      const message = "Login effettuato con successo";
      useAuthStore.setState({
        accessToken: data.accessToken,
        userAuth: data.user,
        isAuthenticated: true,
        message,
      });
      toast.success(message);
    },
    onError: (error) => {
      useAuthStore.setState({
        error: true,
        message: error.message,
      });
      toast.error(error.message);
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
      toast.success(data.message);
    },
    onError: (error) => {
      useAuthStore.setState({
        error: true,
        message: error.message,
      });
      toast.error(error.message);
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
