import "../../global.css";

import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  SplashScreen,
  Stack,
  ThemeProvider,
} from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { PanelUIProvider, useThemeMode } from "panelui-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useUser from "../hooks/useUser";
import { useAuthStore } from "../store/useAuthStore";
import { setupPlayer } from "../services/setupPlayer";
import { useFonts } from "expo-font";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

function ThemedNavigation() {
  const [loaded] = useFonts({
    SpotifyMixLight: require("../../assets/fonts/SpotifyMix-Light.ttf"),
    SpotifyMixRegular: require("../../assets/fonts/SpotifyMix-Regular.ttf"),
    SpotifyMixMedium: require("../../assets/fonts/SpotifyMix-Medium.ttf"),
    SpotifyMixBold: require("../../assets/fonts/SpotifyMix-Bold.ttf"),
    SpotifyMixExtraBold: require("../../assets/fonts/SpotifyMix-Extrabold.ttf"),
    SpotifyMixExtraBlack: require("../../assets/fonts/SpotifyMix-Black.ttf"),
    SpotifyMixUltra: require("../../assets/fonts/SpotifyMix-Ultra.ttf"),
  });

  const { mode } = useThemeMode();
  const [background, card, text, border, primary] = useCSSVariable([
    "--color-background",
    "--color-card",
    "--color-foreground",
    "--color-border",
    "--color-primary",
  ]) as (string | undefined)[];

  useEffect(() => {
    if (background) void SystemUI.setBackgroundColorAsync(background);
  }, [background]);

  const base = mode === "dark" ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...base,
    dark: mode === "dark",
    colors: {
      ...base.colors,
      ...(background ? { background } : null),
      ...(card ? { card } : null),
      ...(text ? { text } : null),
      ...(border ? { border } : null),
      ...(primary ? { primary, notification: primary } : null),
    },
  };

  const { isAuthenticated, isLoading } = useUser();

  useEffect(() => {
    useAuthStore.getState().loadToken();
  }, []);

  useEffect(() => {
    if (!isLoading && loaded) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, loaded]);

  if (!loaded || isLoading) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/signup" />
        </Stack.Protected>

        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="player-modal"
            options={{
              presentation: "transparentModal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack.Protected>
      </Stack>
      <StatusBar style={"light"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    setupPlayer();
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PanelUIProvider>
          <ThemedNavigation />
        </PanelUIProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
