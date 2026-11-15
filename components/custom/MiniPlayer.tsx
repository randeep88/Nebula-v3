import { useLibrary } from "@/src/hooks/useLibrary";
import { usePlayer } from "@/src/hooks/usePlayer";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useProgress } from "@rntp/player";
import { Link } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import { Button } from "panelui-native";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

const MiniPlayer = ({ bottom }: { bottom: number }) => {
  const { next, previous, togglePlayPause, playing, activeItem, currentSong } =
    usePlayer();
  const { position, duration } = useProgress(0.5);
  const { isInLibrary, addSong, removeSong } = useLibrary();
  const { isOffline } = useNetworkStatus();
  const isSongInLibrary = isInLibrary("song", currentSong?.id);
  const toggleLiked = () => {
    if (!currentSong) return;

    if (isSongInLibrary) {
      removeSong(currentSong.id);
    } else {
      addSong(currentSong);
    }
  };

  const onGestureEvent = (event: any) => {
    const { translationX, state } = event.nativeEvent;

    if (state === 5) {
      if (translationX < -50) {
        next();
      } else if (translationX > 50) {
        previous();
      }
    }
  };

  if (!activeItem) return null;

  const image =
    currentSong?.image?.[2]?.url ??
    (typeof activeItem.artworkUrl === "string"
      ? activeItem.artworkUrl
      : undefined);
  const title = currentSong?.name ?? activeItem.title;
  const artist = currentSong?.artists?.primary?.[0]?.name ?? activeItem.artist;

  return (
    <Link href="/player-modal" style={[styles.link, { bottom }]}>
      <View className="flex-row items-center justify-between relative p-1.5 pe-2 overflow-hidden rounded-lg w-full">
        {image ? (
          <Image
            source={{ uri: image }}
            blurRadius={70}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
          />
        ) : null}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.35)" },
          ]}
        />
        <PanGestureHandler onHandlerStateChange={onGestureEvent}>
          <View className="flex-row items-center gap-3 flex-1">
            <Image
              source={{ uri: image }}
              style={{ width: 40, height: 40, borderRadius: 4 }}
            />
            <View className="flex-1">
              <Text numberOfLines={1} className="text-white font-semibold">
                {title}
              </Text>
              <View className="flex-row items-center gap-1">
                {currentSong?.explicit && (
                  <MaterialIcons name="explicit" color="gray" size={16} />
                )}
                <Text
                  numberOfLines={1}
                  className="text-white/80 text-sm font-normal"
                >
                  {artist}
                </Text>
              </View>
            </View>
          </View>
        </PanGestureHandler>

        <View className="flex-row items-center gap-2 h-full">
          {!isOffline && (
            <Button
              variant="ghost"
              className="rounded-full p-0"
              onPress={toggleLiked}
            >
              <MaterialCommunityIcons
                name={isSongInLibrary ? "check-circle" : "plus-circle-outline"}
                size={25}
                color="white"
              />
            </Button>
          )}

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
        </View>

        <View className="mx-2 absolute bottom-0 w-full">
          <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30">
            <View
              className="h-full bg-white"
              style={{
                width: `${duration > 0 ? (position / duration) * 100 : 0}%`,
              }}
            />
          </View>
        </View>
      </View>
    </Link>
  );
};

export default MiniPlayer;

const styles = StyleSheet.create({
  link: {
    position: "absolute",
    elevation: 100,
    left: 10,
    right: 10,
  },
});
