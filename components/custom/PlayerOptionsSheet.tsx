import { useDownload } from "@/src/hooks/useDownload";
import { useLibrary } from "@/src/hooks/useLibrary";
import { usePlayer } from "@/src/hooks/usePlayer";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { EllipsisVertical } from "lucide-react-native";
import { BottomSheet, Button, Item, Text } from "panelui-native";
import React, { useState } from "react";
import { Image, Share, View } from "react-native";
import { useRouter } from "expo-router";
import PlaylistModal from "./PlaylistModal";
import { ACCENT } from "@/src/app/(tabs)/(search)";
import AppToast from "./Toast";

type SongOption = {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
};

const PlayerOptionsSheet = ({ song }: { song: any }) => {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const { showToast } = AppToast();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [playlistMounted, setPlaylistMounted] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const { addToQueue, playNext } = usePlayer();
  const { addSong, removeSong, isInLibrary } = useLibrary();
  const { downloadSong, removeDownload, isDownloaded, isDownloading } =
    useDownload();

  if (!song) return <View className="w-10" />;

  const downloaded = isDownloaded(song?.id);
  const primaryArtist = song?.artists?.primary?.[0]?.name;
  const primaryArtistId = song?.artists?.primary?.[0]?.id;
  const albumId = song?.album?.id;
  const isSongInLibrary = isInLibrary("song", song?.id);

  const toggleLiked = () => {
    if (isSongInLibrary) removeSong(song.id);
    else addSong(song);
  };

  const options: SongOption[] = [
    ...(!isOffline
      ? [
          {
            icon: isSongInLibrary ? "check-circle" : "plus-circle-outline",
            color: isSongInLibrary ? ACCENT : undefined,
            label: isSongInLibrary
              ? "Remove from Liked Songs"
              : "Add to Liked Songs",
            onPress: toggleLiked,
          },
        ]
      : []),
    {
      icon: "playlist-play",
      label: "Play Next",
      onPress: () => {
        if (playNext(song))
          showToast({
            message: `${song?.name} will play next`,
            variant: "info",
          });
      },
    },
    {
      icon: "playlist-music",
      label: "Add to Queue",
      onPress: () => {
        if (addToQueue(song))
          showToast({
            message: `${song?.name} added to queue`,
            variant: "success",
          });
      },
    },
    ...(!isOffline
      ? [
          {
            icon: "playlist-plus",
            label: "Add to Playlist",
            onPress: () => {
              setPlaylistMounted(true);
              setTimeout(() => setPlaylistOpen(true), 250);
            },
          },
          {
            icon: downloaded ? "download-off" : "download",
            label: downloaded
              ? "Remove download"
              : isDownloading(song?.id)
                ? "Downloading..."
                : "Download",
            onPress: () => {
              if (downloaded) removeDownload(song.id);
              else if (!isDownloading(song?.id)) downloadSong(song);
            },
          },
          ...(primaryArtistId
            ? [
                {
                  icon: "account-music",
                  label: "Go to Artist",
                  onPress: () =>
                    router.push({
                      pathname: "/(tabs)/(home)/artist/[artistId]",
                      params: { artistId: primaryArtistId },
                    } as any),
                },
              ]
            : []),
          ...(albumId
            ? [
                {
                  icon: "album",
                  label: "Go to Album",
                  onPress: () =>
                    router.push({
                      pathname: "/(tabs)/(home)/album/[albumId]",
                      params: { albumId },
                    }),
                },
              ]
            : []),
        ]
      : []),
  ];

  return (
    <>
      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <BottomSheet.Trigger>
          <Button size="icon" variant="ghost" className="rounded-full">
            <EllipsisVertical size={24} color="white" />
          </Button>
        </BottomSheet.Trigger>
        <BottomSheet.Content showClose={false}>
          <View className="flex-row items-center gap-3 px-0 pb-3">
            <Image
              source={{ uri: song?.image?.[2]?.url }}
              style={{ width: 52, height: 52, borderRadius: 6 }}
              resizeMode="cover"
            />
            <View className="flex-1 min-w-0">
              <Text weight="semibold" numberOfLines={1}>
                {song?.name}
              </Text>
              <Text
                size="sm"
                className="text-muted-foreground"
                numberOfLines={1}
              >
                {primaryArtist}
              </Text>
            </View>
          </View>

          <View className="h-px bg-border mb-1" />

          {options.map((option) => (
            <Item
              disabled={option.label === "Downloading..."}
              key={option.label}
              variant="default"
              className="px-0 py-3 border-0 bg-transparent"
              onPress={() => {
                setSheetOpen(false);
                option.onPress();
              }}
            >
              <Item.Media>
                <MaterialCommunityIcons
                  name={option.icon as any}
                  size={23}
                  color={option.color ?? "white"}
                />
              </Item.Media>
              <Item.Content>
                <Item.Title className="font-normal">{option.label}</Item.Title>
              </Item.Content>
            </Item>
          ))}
        </BottomSheet.Content>
      </BottomSheet>

      {playlistMounted && (
        <PlaylistModal
          open={playlistOpen}
          onOpenChange={setPlaylistOpen}
          song={song}
        />
      )}
    </>
  );
};

export default PlayerOptionsSheet;
