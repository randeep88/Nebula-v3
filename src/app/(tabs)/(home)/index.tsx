import MediaCard from "@/components/custom/MediaCard";
import TitleBar from "@/components/custom/TitleBar";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useRouter } from "expo-router";
import {
  AudioLines,
  Compass,
  EighthNote,
  Search,
  Shuffle,
} from "lucide-react-native";
import { Button, Item, Loader } from "panelui-native";
import { useMemo } from "react";
import { FlatList, Image, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePlayer } from "@/src/hooks/usePlayer";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import OfflineState from "@/components/custom/OfflineState";
import EmptyView from "@/components/custom/EmptyView";

const seededRandom = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getDailySeed = () => {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const dailyShuffle = (list: any[]) => {
  const arr = [...list];
  const random = seededRandom(getDailySeed());
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const HomeContent = () => {
  const {
    isSongPlaying,
    playSong,
    playShuffled,
    togglePlayPause,
    activeItem,
    playing,
  } = usePlayer();

  const { isOffline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { libraryItems, isLoading } = useLibrary();

  const recent = [
    {
      name: "Liked Songs",
      image: require("../../../../assets/images/lb.png"),
      onpress: () => router.push("/(tabs)/(home)/LikedSongs"),
    },
    {
      name: "Your Playlists",
      image: require("../../../../assets/images/pb.png"),
      onpress: () => router.push("/(tabs)/(playlist)"),
    },
  ];

  const dailyMix = useMemo(() => {
    const songs = (libraryItems || [])
      .filter((entry: any) => entry.type === "song" && entry.success)
      .map((entry: any) => entry.data?.[0])
      .filter(Boolean);
    return dailyShuffle(songs).slice(0, 15);
  }, [libraryItems]);

  const playMix = () => playShuffled(dailyMix);

  if (isOffline) return <OfflineState />;

  return (
    <ScrollView
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 40,
        paddingHorizontal: 16,
        gap: 20,
      }}
    >
      <TitleBar tab="Home" />

      {activeItem && (
        <View>
          <Text className="text-white font-bold text-lg mb-2 tracking-tight">
            Continue listening
          </Text>
          <Item variant="muted" className="p-2">
            <Item.Media variant="image" className="size-17">
              <Image
                source={{
                  uri: activeItem?.artworkUrl
                    ? String(activeItem.artworkUrl)
                    : undefined,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  resizeMode: "contain",
                }}
              />
            </Item.Media>
            <Item.Content>
              <Item.Title className="font-semibold text-lg" numberOfLines={1}>
                {activeItem?.title}
              </Item.Title>
              <Item.Description
                numberOfLines={1}
                className="text-sm text-white/60"
              >
                {activeItem?.artist}
              </Item.Description>
            </Item.Content>
            <Item.Actions className="pe-2">
              <Button
                variant="ghost"
                className="rounded-full p-0"
                onPress={togglePlayPause}
              >
                <MaterialCommunityIcons
                  name={playing ? "pause" : "play"}
                  color="white"
                  size={32}
                />
              </Button>
            </Item.Actions>
          </Item>
        </View>
      )}

      <View className="flex-row justify-center gap-3 px-1.5 w-fit">
        {recent.map((item: any, index: number) => (
          <Item
            key={index}
            variant="muted"
            className="p-0 w-[50%]"
            onPress={() => item.onpress()}
          >
            <Item.Media variant="image" className="rounded-e-none">
              <Image
                source={item.image}
                style={{ objectFit: "contain", width: "100%" }}
              />
            </Item.Media>
            <Item.Content>
              <Item.Title className="text-sm">{item.name}</Item.Title>
            </Item.Content>
          </Item>
        ))}
      </View>

      {isLoading ? (
        <View className="h-full">
          <Loader
            variant="bouncing-bars"
            color="white"
            className="h-full w-full"
          />
        </View>
      ) : (
        <>
          {dailyMix.length === 0 && (
            <View className="items-center jusitfy-center bg-accent rounded-2xl">
              <EmptyView
                className="m-10"
                fill
                icon={<EighthNote size={18} color="gray" />}
                title=" Your Daily Mix is waiting"
                description="Add some songs to your library and a fresh mix will show up here
                every day."
                actions={[
                  {
                    label: "Find Your Sound",
                    icon: <AudioLines size={18} color="white" />,
                    onPress: () => router.push("/(tabs)/(search)"),
                  },
                ]}
              />
            </View>
          )}
          {dailyMix.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="text-white font-bold text-lg tracking-tight">
                    Daily Mix
                  </Text>
                  <Text className="text-white/50 text-xs font-normal">
                    Fresh from your library, every day
                  </Text>
                </View>
                <Button
                  size="xs"
                  variant="secondary"
                  onPress={playMix}
                  className="rounded-full"
                >
                  <Shuffle size={13} color="white" />
                  Shuffle play
                </Button>
              </View>

              <FlatList
                scrollEnabled={false}
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                numColumns={2}
                columnWrapperStyle={{ gap: 12 }}
                contentContainerStyle={{ paddingBottom: 120, gap: 12 }}
                data={dailyMix}
                keyExtractor={(item: any, index) => item.id ?? String(index)}
                initialNumToRender={8}
                maxToRenderPerBatch={5}
                windowSize={5}
                updateCellsBatchingPeriod={50}
                removeClippedSubviews
                renderItem={({ item }: { item: any }) => {
                  return (
                    <View style={{ width: "48%" }}>
                      <MediaCard
                        isPlaying={isSongPlaying(item)}
                        item={item}
                        type="song"
                        onPress={() => playSong(item, dailyMix)}
                      />
                    </View>
                  );
                }}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const Home = () => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return <OfflineState />;
  }

  return <HomeContent />;
};

export default Home;
