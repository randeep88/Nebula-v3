import "../../global.css";

import { useEffect } from "react";
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCSSVariable } from "uniwind";
import { PanelUIProvider, useThemeMode } from "panelui-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function ThemedNavigation() {
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

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
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
