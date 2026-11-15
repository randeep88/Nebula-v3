import { useMutation, useQueryClient } from "@tanstack/react-query";
import { backendAPI } from "../utils/backendAPI";
import { useAuthStore } from "../store/useAuthStore";
import AppToast from "@/components/custom/Toast";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { showToast } = AppToast();

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: async ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => {
      const response = await backendAPI.post("/auth/login", {
        username,
        password,
      });
      return response.data;
    },
    onSuccess: async ({ token, user }) => {
      if (user) queryClient.setQueryData(["user", token], user);
      await useAuthStore.getState().setToken(token);
      showToast({
        message: "You're in! Let's go 🎧",
        variant: "success",
      });
    },
    onError: (err: any) => {
      console.log("failed to login: ", err);
      showToast({
        message: err?.response?.data?.message || "Login failed",
        variant: "destructive",
      });
    },
  });

  return { loginMutate, isPending };
};
