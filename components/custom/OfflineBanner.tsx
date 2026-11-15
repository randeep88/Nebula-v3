import { View, Text, StyleSheet } from "react-native";
import { WifiOff, Wifi } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import { useEffect, useRef, useState } from "react";

const BLUE = "#2563EB";
const GREEN = "#16A34A";
const DELAY = 2000;

const OfflineBanner = ({
  onVisibleChange,
}: {
  onVisibleChange?: (visible: boolean) => void;
}) => {
  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [bg, setBg] = useState("transparent");
  const wasOffline = useRef(false);

  useEffect(() => {
    onVisibleChange?.(visible);
  }, [visible]);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      setVisible(true);
      setBg(BLUE);

      const timer = setTimeout(() => setBg("transparent"), DELAY);
      return () => clearTimeout(timer);
    }

    if (wasOffline.current) {
      setVisible(true);
      setBg(GREEN);

      const timer = setTimeout(() => {
        wasOffline.current = false;
        setVisible(false);
      }, DELAY);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { backgroundColor: bg, paddingBottom: insets.bottom, paddingTop: 5 },
      ]}
    >
      {isOffline && <WifiOff size={15} color="#fff" />}
      <Text style={styles.text}>
        {isOffline
          ? "You're offline · Downloads are still available"
          : "You're back online"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default OfflineBanner;
