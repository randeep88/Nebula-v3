import { useState } from "react";
import {
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { RepeatMode, useProgress } from "@rntp/player";
import { ChevronDown, ListMusic } from "lucide-react-native";
import { Button, Item, Separator, Tooltip } from "panelui-native";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDownload } from "@/src/hooks/useDownload";
import { useLibrary } from "@/src/hooks/useLibrary";
import { usePlayer } from "@/src/hooks/usePlayer";
import Slider from "@react-native-community/slider";
import { formatDuration } from "../utils/formatDuration";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import QueueSheet from "@/components/custom/QueueSheet";
import { useAudioQuality } from "../store/useAudioQuality";
import Spinner from "@/components/custom/Spinner";
import { ACCENT } from "./(tabs)/(search)";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import PlayerOptionsSheet from "@/components/custom/PlayerOptionsSheet";

const artworkOf = (item: any): string | undefined =>
  typeof item?.artworkUrl === "string" ? item.artworkUrl : undefined;

const PlayerModal = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { position, duration } = useProgress(0.5);
  const { quality } = useAudioQuality();

  const {
    activeItem,
    currentSong,
    activeIndex,
    playing,
    queue,
    repeat,
    togglePlayPause,
    next,
    previous,
    seekTo,
    toggleShuffle,
    cycleRepeat,
    shuffle,
  } = usePlayer();

  const { isInLibrary, addSong, removeSong } = useLibrary();

  const wraps = queue.length > 1 && (shuffle || repeat === RepeatMode.All);
  const hasNext = wraps || activeIndex + 1 < queue.length;
  const hasPrevious = wraps || activeIndex > 0;

  const isSongInLibrary = isInLibrary("song", currentSong?.id);

  const toggleLiked = () => {
    if (!currentSong) return;

    if (isSongInLibrary) {
      removeSong(currentSong.id);
    } else {
      addSong(currentSong);
    }
  };

  const {
    downloadSong,
    removeDownload,
    isDownloaded,
    isDownloading,
    getDownloadedQuality,
    downloadedSongs,
  } = useDownload();

  const { isOffline } = useNetworkStatus();

  const translateY = useSharedValue(0);

  const close = () => router.back();

  const panGesture = Gesture.Pan()
    .activeOffsetY(15)
    .failOffsetX([-25, 25])
    .onUpdate((e) => {
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > 120 || e.velocityY > 900) {
        translateY.value = withTiming(height, { duration: 220 }, (finished) => {
          if (finished) runOnJS(close)();
        });
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const artwork = artworkOf(activeItem);
  const artSize = Math.min(width - 48, height * 0.4);

  const downloaded = isDownloaded(currentSong?.id);
  const downloading = isDownloading(currentSong?.id);

  const downloadedQuality = downloaded
    ? getDownloadedQuality(currentSong?.id)
    : undefined;

  const toggleDownload = () => {
    if (!currentSong) return;
    if (downloaded) removeDownload(currentSong.id);
    else downloadSong(currentSong);
  };

  if (!activeItem) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          className="flex-1 bg-background items-center justify-center gap-4 px-8"
          style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        >
          <ListMusic size={48} color="gray" />
          <Text className="text-xl font-bold">Nothing is playing</Text>
          <Text className="text-muted-foreground text-center">
            Pick a song and it will show up here.
          </Text>
          <Button onPress={close}>Close</Button>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[{ flex: 1, backgroundColor: "#000" }, animatedStyle]}
        >
          {artwork ? (
            <Image
              source={{ uri: artwork }}
              blurRadius={70}
              resizeMode="cover"
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: "rgba(0,0,0,0.6)" },
            ]}
          />

          <View
            className="flex-1 px-6"
            style={{
              paddingTop: insets.top + 8,
              paddingBottom: insets.bottom + 16,
            }}
          >
            <View className="flex-row items-center justify-between">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onPress={close}
              >
                <ChevronDown size={24} color="white" />
              </Button>
              <View className="flex-1 items-center">
                <Text className="text-white/70 text-xs font-normal">
                  Playing from album
                </Text>
                <Text
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/(home)/album/[albumId]",
                      params: { albumId: currentSong?.album?.id },
                    })
                  }
                  className="text-white font-semibold text-sm"
                  numberOfLines={1}
                >
                  {currentSong?.album?.name ?? activeItem.title}
                </Text>
              </View>
              <PlayerOptionsSheet song={currentSong} />
            </View>

            <View className="py-4 items-center justify-center">
              <Image
                source={{ uri: artwork }}
                resizeMode="cover"
                style={{
                  width: artSize,
                  height: artSize,
                  borderRadius: 10,
                  backgroundColor: "#27272a",
                }}
              />
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 min-w-0">
                  <Text
                    className="text-white text-xl font-semibold"
                    numberOfLines={1}
                  >
                    {activeItem.title}
                  </Text>
                  <Text
                    className="text-white/70 font-normal text-base"
                    numberOfLines={1}
                  >
                    {activeItem.artist}
                  </Text>
                </View>
                {!isOffline && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full"
                    onPress={toggleLiked}
                  >
                    <MaterialCommunityIcons
                      name={
                        isSongInLibrary ? "check-circle" : "plus-circle-outline"
                      }
                      size={30}
                      color={isSongInLibrary ? ACCENT : "white"}
                    />
                  </Button>
                )}
              </View>

              <View className="-mx-3 mt-2">
                <Slider
                  style={{
                    width: "100%",
                    height: 10,
                  }}
                  minimumValue={0}
                  maximumValue={duration}
                  value={position}
                  onSlidingComplete={(value) => seekTo(value)}
                  minimumTrackTintColor="#fff"
                  maximumTrackTintColor="#ffffff80"
                  thumbTintColor="#fff"
                />
                <View className="flex-row items-center justify-between mt-2 px-4">
                  <Text className="text-white text-xs">
                    {formatDuration(position)}
                  </Text>
                  <Text className="text-white text-xs">
                    {formatDuration(duration)}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onPress={toggleShuffle}
                >
                  <MaterialCommunityIcons
                    name="shuffle"
                    size={24}
                    color={shuffle ? ACCENT : "white"}
                  />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onPress={previous}
                  disabled={!hasPrevious}
                >
                  <MaterialCommunityIcons
                    name="skip-previous"
                    size={40}
                    color="white"
                  />
                </Button>

                <Button
                  variant="ghost"
                  className="rounded-full p-0"
                  onPress={togglePlayPause}
                >
                  <MaterialCommunityIcons
                    name={playing ? "pause-circle" : "play-circle"}
                    color="white"
                    size={70}
                  />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onPress={next}
                  disabled={!hasNext}
                >
                  <MaterialCommunityIcons
                    name="skip-next"
                    size={40}
                    color="white"
                  />
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onPress={cycleRepeat}
                >
                  {repeat === RepeatMode.One ? (
                    <MaterialCommunityIcons
                      name="repeat-once"
                      size={24}
                      color={ACCENT}
                    />
                  ) : (
                    <MaterialCommunityIcons
                      name="repeat"
                      size={24}
                      color={repeat === RepeatMode.All ? ACCENT : "white"}
                    />
                  )}
                </Button>
              </View>

              <View className="flex-row items-center justify-between">
                <Tooltip label="Copy link">
                  <Tooltip.Trigger>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="rounded-full"
                      disabled={downloading || !currentSong}
                      onPress={toggleDownload}
                    >
                      {downloading ? (
                        <Spinner size={24} />
                      ) : downloaded ? (
                        <MaterialCommunityIcons
                          name="download-off"
                          size={24}
                          color="white"
                        />
                      ) : (
                        <MaterialCommunityIcons
                          name="download"
                          size={24}
                          color="white"
                        />
                      )}
                    </Button>
                  </Tooltip.Trigger>

                  <Tooltip.Content>
                    <Tooltip.Arrow />
                    {downloaded ? "Remove Downloaded" : "Download Song"}
                  </Tooltip.Content>
                </Tooltip>
                <Text className="text-center text-white/60 text-xs font-normal">
                  MP3 &bull; {downloadedQuality ?? quality}
                </Text>

                <QueueSheet />
              </View>

              <Separator />
              {activeIndex + 1 < queue?.length ? (
                <View className="w-full items-start justify-start gap-2">
                  <Text className="text-white/70 text-xs uppercase font-medium w-full">
                    up next
                  </Text>
                  {queue?.length > 0 && (
                    <Item variant="default" className="p-0">
                      <Item.Media
                        variant="image"
                        className="size-12 rounded-sm"
                      >
                        <Image
                          source={{
                            uri: queue[activeIndex + 1]?.artworkUrl
                              ? String(queue[activeIndex + 1].artworkUrl)
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
                        <Item.Title className="font-normal" numberOfLines={1}>
                          {queue[activeIndex + 1]?.title}
                        </Item.Title>
                        <Item.Description
                          numberOfLines={1}
                          className="text-sm text-white/60"
                        >
                          {queue[activeIndex + 1]?.artist}
                        </Item.Description>
                      </Item.Content>
                    </Item>
                  )}
                </View>
              ) : (
                <View className="w-full px-2 items-start justify-start gap-1">
                  <Text className="text-white text-sm uppercase tracking-wider w-full">
                    up next
                  </Text>
                  <Text className="text-white/70 text-sm text-center py-4 w-full">
                    Upcoming song will be shown here
                  </Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default PlayerModal;
