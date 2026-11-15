import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { backendAPI } from "../utils/backendAPI";
import AppToast from "@/components/custom/Toast";

export const useRegister = () => {
  const router = useRouter();
  const { showToast } = AppToast();

  const { mutate: registerMutate, isPending } = useMutation({
    mutationFn: async (data: any) => {
      const response = await backendAPI.post("/auth/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },

    onSuccess: async () => {
      showToast({
        message: "Registration successful! Please login.",
        variant: "success",
      });
      router.push("/(auth)/login");
    },

    onError: (err) => {
      console.error("Registration error:", err);
      showToast({
        message: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  return { registerMutate, isPending };
};
