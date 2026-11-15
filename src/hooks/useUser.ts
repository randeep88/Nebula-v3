import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { backendAPI } from "../utils/backendAPI";
import { useAuthStore } from "../store/useAuthStore";
import { useNetworkStatus } from "./useNetworkStatus";

const useUser = () => {
  const { isOffline } = useNetworkStatus();
  const queryClient = useQueryClient();

  const token = useAuthStore((s) => s.token);
  const isTokenLoading = useAuthStore((s) => s.isTokenLoading);
  const setToken = useAuthStore((s) => s.setToken);
  const clearToken = useAuthStore((s) => s.clearToken);

  const {
    data: user,
    isPending: isUserPending,
    isError,
    error,
    isFetching,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user", token],
    queryFn: async () => {
      const res = await backendAPI.get("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    enabled: !!token && !isOffline,
    retry: 2,
    staleTime: Infinity,
  });

  const login = useCallback(
    async (newToken: string, userData?: any) => {
      if (userData) queryClient.setQueryData(["user", newToken], userData);
      await setToken(newToken);
    },
    [queryClient, setToken],
  );

  const logout = useCallback(async () => {
    await clearToken();
    queryClient.removeQueries();
  }, [queryClient, clearToken]);

  useEffect(() => {
    if (token && isError && (error as any)?.response?.status === 401) {
      logout();
    }
  }, [token, isError, error, logout]);

  const isAuthenticated = !!token && (!!user?._id || isOffline);

  const isLoading = isTokenLoading || (!!token && isUserPending && !isOffline);

  return {
    user,
    isLoading,
    isFetching,
    isAuthenticated,
    refetchUser,
    token,
    login,
    logout,
  };
};

export default useUser;
