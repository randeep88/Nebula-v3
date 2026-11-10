import { useMutation, useQueryClient } from "@tanstack/react-query";
import { backendAPI } from "../utils/backendAPI";
import { useAuthStore } from "../store/useAuthStore";
import { useToast } from "@/components/ui/toast";

export const useLogin = () => {
  const queryClient = useQueryClient();
  const {toast} = useToast();

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
      toast.show("You're in! Let's go 🎧");
    },
    onError: (err: any) => {
      console.log("failed to login: ", err);
      toast.show(err?.response?.data?.message || "Login failed");
    },
  });

  return { loginMutate, isPending };
};
