import { Tabs } from "expo-router";
import { Pressable, View } from "react-native";
import { House, Search, Library, ListVideo } from "lucide-react-native";
import { Panelside } from "panelui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import MiniPlayer from "@/components/custom/MiniPlayer";
import OfflineBanner from "@/components/custom/OfflineBanner";
import ProfilePanel from "@/components/custom/ProfilePanel";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { useEffect, useState } from "react";
import TrackPlayer from "@rntp/player";

const TAB_HEIGHT = 50;

const TabButton = (props: any) => (
  <Pressable
    {...props}
    android_ripple={null}
    onPressIn={props.onPress}
    onPress={undefined}
    style={[
      props.style,
      {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
    ]}
  />
);

export default function TabsLayout() {
  const setCurrentSong = usePlayerStore((s) => s.setCurrentSong);

  useEffect(() => {
    const syncFromPlayer = async () => {
      try {
        const track = await TrackPlayer.getActiveMediaItem();
        if (!track) return;

        const id = String(track.mediaId);
        const saved = usePlayerStore.getState().songsById[id];

        setCurrentSong(
          saved ?? {
            id,
            title: track.title ?? "",
            artist: track.artist ?? "",
            url: track.url as string,
            artwork: track.artworkUrl,
          },
        );
      } catch {}
    };

    syncFromPlayer();
  }, []);

  const insets = useSafeAreaInsets();

  const [bannerVisible, setBannerVisible] = useState(false);

  const BANNER_HEIGHT = bannerVisible ? 55 : 0;

  const tabBottom = insets.bottom + BANNER_HEIGHT;

  const playerBottom = tabBottom + TAB_HEIGHT - BANNER_HEIGHT / 2;

  return (
    <Panelside swipeEnabled={false} haptics radius={32} dim={0.55}>
      <Panelside.Panel>
        <ProfilePanel />
      </Panelside.Panel>

      <Panelside.Scene className="flex-1">
        <View style={{ flex: 1 }}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: "white",
              tabBarInactiveTintColor: "gray",
              headerShown: false,
              tabBarShowLabel: false,
              tabBarButton: TabButton,
              tabBarStyle: {
                borderTopWidth: 0,
                elevation: 0,
                shadowOpacity: 0,
                backgroundColor: "transparent",
                position: "absolute",
                paddingBottom: insets.bottom + 10,
                bottom: 0,
                left: 0,
                right: 0,
                height: TAB_HEIGHT + BANNER_HEIGHT,
                zIndex: 10,
              },
            }}
          >
            <Tabs.Screen
              name="(home)"
              options={{
                title: "Home",
                tabBarIcon: ({ color }: any) => (
                  <House color={color} size={26} />
                ),
              }}
            />

            <Tabs.Screen
              name="(search)"
              options={{
                title: "Search",
                tabBarIcon: ({ color }: any) => (
                  <Search color={color} size={26} />
                ),
              }}
            />

            <Tabs.Screen
              name="(library)"
              options={{
                title: "Library",
                tabBarIcon: ({ color }: any) => (
                  <Library color={color} size={26} />
                ),
              }}
            />

            <Tabs.Screen
              name="(playlist)"
              options={{
                title: "Playlist",
                tabBarIcon: ({ color }: any) => (
                  <ListVideo color={color} size={26} />
                ),
              }}
            />
          </Tabs>

          <LinearGradient
            colors={[
              "transparent",
              "rgba(0, 0, 0, 0.6)",
              "rgba(0, 0, 0, 0.8)",
              "rgba(0, 0, 0, 0.9)",
              "black",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 80 + BANNER_HEIGHT,
              zIndex: 0,
            }}
          />

          <MiniPlayer bottom={playerBottom} />

          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 20000,
            }}
          >
            <OfflineBanner onVisibleChange={setBannerVisible} />
          </View>
        </View>
      </Panelside.Scene>
    </Panelside>
  );
}
