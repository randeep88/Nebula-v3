import { useState } from "react";
import { FlatList, Image, useWindowDimensions, View } from "react-native";
import { useRouter } from "expo-router";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { ListVideo, RefreshCw } from "lucide-react-native";
import { BottomSheet, Button, Item, Loader, Text } from "panelui-native";
import { useCSSVariable } from "uniwind";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import EmptyView from "./EmptyView";

type PlaylistModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  song: any;
};

const playlistIdOf = (playlist: any) => String(playlist?._id ?? playlist?.id);

const hasSong = (playlist: any, songId?: string) =>
  !!songId &&
  (playlist?.songs ?? []).some(
    (s: any) => String(s?.id ?? s?.songId ?? s?._id ?? s) === String(songId),
  );

const PlaylistModal = ({ open, onOpenChange, song }: PlaylistModalProps) => {
  const router = useRouter();
  const { height } = useWindowDimensions();
  const primary = (useCSSVariable("--color-primary") as string) ?? "#00C0D0";

  const {
    myPlaylists,
    addSong,
    removeSongFromPlaylist,
    addingSong,
    loadingPlaylists,
    refetchPlaylists,
  } = useMyPlaylist();
  const [selected, setSelected] = useState<string[]>([]);
  const [toRemove, setToRemove] = useState<string[]>([]);

  const playlists: any[] = myPlaylists ?? [];
  const isEmpty = !loadingPlaylists && playlists.length === 0;
  const artist = song?.artists?.primary?.[0]?.name;
  const changeCount = selected.length + toRemove.length;

  const handleOpenChange = (value: boolean) => {
    if (!value) {
      setSelected([]);
      setToRemove([]);
    }
    onOpenChange(value);
  };

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleRemove = (id: string) => {
    setToRemove((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDone = () => {
    if (changeCount === 0 || !song?.id) return;
    if (selected.length > 0) {
      addSong({ playlistIds: selected, songId: song.id });
    }
    toRemove.forEach((playlistId) => {
      removeSongFromPlaylist({ playlistId, songId: song.id });
    });
    handleOpenChange(false);
  };

  const goToPlaylists = () => {
    handleOpenChange(false);
    router.push("/(tabs)/(playlist)");
  };

  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const handleRefresh = () => {
    rotation.value = 0;
    rotation.value = withTiming(360, { duration: 1000 });

    refetchPlaylists();
  };
  return (
    <BottomSheet open={open} onOpenChange={handleOpenChange}>
      <BottomSheet.Content showClose={false}>
        <View className="items-center flex-row justify-between">
          <View className="pb-3">
            <Text size="xl" weight="semibold">
              Add to playlists
            </Text>
            <Text size="sm" className="text-muted-foreground" numberOfLines={1}>
              {song?.name}
              {artist ? ` • ${artist}` : ""}
            </Text>
          </View>
          <Button
            onPress={handleRefresh}
            variant="secondary"
            size="icon"
            className="rounded-full"
          >
            <Animated.View style={animatedStyle}>
              <RefreshCw color="white" size={18} />
            </Animated.View>
          </Button>
        </View>

        {loadingPlaylists ? (
          <View className="h-40">
            <Loader
              variant="bouncing-bars"
              color="white"
              className="h-full w-full"
            />
          </View>
        ) : isEmpty ? (
          <View className="items-center gap-4 pb-4">
            <EmptyView
              icon={<ListVideo size={18} color="gray" />}
              title="No playlists yet"
              description="Create your first playlist to keep the songs you love in one place."
              actions={[
                {
                  label: "Go to playlists",
                  onPress: goToPlaylists,
                },
              ]}
            />
          </View>
        ) : (
          <>
            <View style={{ maxHeight: height * 0.4 }}>
              <FlatList
                data={playlists}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) =>
                  playlistIdOf(item) ?? String(index)
                }
                renderItem={({ item }) => {
                  const id = playlistIdOf(item);
                  const added = hasSong(item, song?.id);
                  const markedRemove = toRemove.includes(id);
                  const isSelected = added
                    ? !markedRemove
                    : selected.includes(id);
                  const count = item?.songs?.length ?? 0;

                  return (
                    <Item
                      variant="default"
                      className="px-0 py-2 border-0 bg-transparent"
                      onPress={() => {
                        if (added) toggleRemove(id);
                        else toggle(id);
                      }}
                    >
                      <Item.Media
                        variant="image"
                        className="size-12 rounded-sm"
                      >
                        {item?.coverImage ? (
                          <Image
                            source={{ uri: item.coverImage }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full items-center justify-center bg-muted">
                            <MaterialCommunityIcons
                              name="playlist-music"
                              size={24}
                              color="gray"
                            />
                          </View>
                        )}
                      </Item.Media>
                      <Item.Content>
                        <Item.Title className="font-normal" numberOfLines={1}>
                          {item?.name}
                        </Item.Title>
                        <Item.Description numberOfLines={1}>
                          {added
                            ? markedRemove
                              ? "Will be removed"
                              : "Already added"
                            : `${count} ${count === 1 ? "song" : "songs"}`}
                        </Item.Description>
                      </Item.Content>
                      <Item.Actions>
                        <MaterialCommunityIcons
                          name={
                            isSelected
                              ? "checkbox-marked"
                              : "checkbox-blank-outline"
                          }
                          size={24}
                          color={isSelected ? primary : "gray"}
                        />
                      </Item.Actions>
                    </Item>
                  );
                }}
              />
            </View>

            <View className="flex-row justify-end gap-2 py-5">
              <Button
                variant="ghost"
                size="sm"
                onPress={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={changeCount === 0 || addingSong}
                onPress={handleDone}
              >
                {changeCount > 0 ? `Done (${changeCount})` : "Done"}
              </Button>
            </View>
          </>
        )}
      </BottomSheet.Content>
    </BottomSheet>
  );
};

export default PlaylistModal;