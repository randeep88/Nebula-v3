import { useNetInfo } from "@react-native-community/netinfo";

export const useNetworkStatus = () => {
  const netInfo = useNetInfo();

  const isOffline =
    netInfo.isConnected === false ||
    netInfo.isInternetReachable === false;

  return {
    isOffline,
    isOnline: !isOffline,
    isConnected: netInfo.isConnected,
    isInternetReachable: netInfo.isInternetReachable,
  };
};
