import { useDownload } from "@/src/hooks/useDownload";
import { useLibrary } from "@/src/hooks/useLibrary";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import { usePlayer } from "@/src/hooks/usePlayer";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { EllipsisVertical } from "lucide-react-native";
import { BottomSheet, Button, Item, Text } from "panelui-native";
import React, { useState } from "react";
import { Image, Share, View } from "react-native";
import { useRouter } from "expo-router";
import PlaylistModal from "./PlaylistModal";
import { ACCENT } from "@/src/app/(tabs)/(search)";
import AppToast from "./Toast";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";

type SongOption = {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
};

const Songs = ({
  playlistId,
  showRemoveFromPlaylist = false,
  showAddButton = true,
  isAlbum = false,
  isArtist = false,
  item,
  handlePlaySong,
  showAddedToLiked = !showAddButton && (isAlbum || isArtist),
}: {
  playlistId?: string;
  showRemoveFromPlaylist?: boolean;
  showAddedToLiked?: boolean;
  showAddButton?: boolean;
  isArtist?: boolean;
  isAlbum?: boolean;
  item: any;
  handlePlaySong: (item: any) => void;
}) => {
  const router = useRouter();
  const { isOffline } = useNetworkStatus();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { showToast } = AppToast();
  const [playlistMounted, setPlaylistMounted] = useState(false);
  const [playlistOpen, setPlaylistOpen] = useState(false);

  const { isSongPlaying, addToQueue, playNext } = usePlayer();
  const { removeSongFromPlaylist } = useMyPlaylist();
  const { addSong, removeSong, isInLibrary } = useLibrary();
  const { downloadSong, removeDownload, isDownloaded, isDownloading } =
    useDownload();

  const playing = isSongPlaying(item);
  const downloaded = isDownloaded(item?.id);
  const primaryArtist = item?.artists?.primary?.[0]?.name;
  const primaryArtistId = item?.artists?.primary?.[0]?.id;
  const albumId = item?.album?.id;

  const isSongInLibrary = isInLibrary("song", item?.id);

  const subtitle = isAlbum
    ? [
        primaryArtist,
        ...(item?.artists?.featured?.slice(0, 2)?.map((a: any) => a?.name) ??
          []),
      ]
        .filter(Boolean)
        .join(", ")
    : isArtist
      ? item?.album?.name
      : primaryArtist;

  const toggleLiked = () => {
    if (isSongInLibrary) {
      removeSong(item.id);
    } else {
      addSong(item);
    }
  };

  const handleShare = async () => {
    try {
      const text = [item?.name, primaryArtist].filter(Boolean).join(" - ");
      await Share.share({
        message: item?.url ? `${text}\n${item.url}` : text,
      });
    } catch {
      showToast({ message: "Unable to share", variant: "destructive" });
    }
  };

  const playlistOption: SongOption[] = !isOffline
    ? [
        {
          icon: "playlist-plus",
          label: "Add to Playlist",
          onPress: () => {
            setPlaylistMounted(true);
            setTimeout(() => setPlaylistOpen(true), 250);
          },
        },
        ...(showRemoveFromPlaylist
          ? [
              {
                icon: "playlist-remove",
                label: "Remove from Playlist",
                onPress: () => {
                  if (!playlistId) {
                    showToast({
                      message: "Playlist ID is required",
                      variant: "destructive",
                    });
                    return;
                  }
                  removeSongFromPlaylist({ playlistId, songId: item.id });
                  showToast({
                    message: "Song removed from playlist",
                    variant: "default",
                  });
                },
              },
            ]
          : []),
      ]
    : [];

  const navigationOption: SongOption[] = !isOffline
    ? [
        ...(!isArtist && primaryArtistId
          ? [
              {
                icon: "account-music",
                label: "Go to Artist",
                onPress: () => router.push(`/artist/${primaryArtistId}` as any),
              },
            ]
          : []),
        ...(!isAlbum && albumId
          ? [
              {
                icon: "album",
                label: "Go to Album",
                onPress: () => router.push(`/album/${albumId}` as any),
              },
            ]
          : []),
      ]
    : [];

  const options: SongOption[] = [
    ...(showAddButton
      ? []
      : [
          {
            icon: isSongInLibrary ? "check-circle" : "plus-circle-outline",
            color: isSongInLibrary ? ACCENT : undefined,
            label: isSongInLibrary
              ? "Remove from Liked Songs"
              : "Add to Liked Songs",
            onPress: toggleLiked,
          },
        ]),
    {
      icon: "playlist-play",
      label: "Play Next",
      onPress: () => {
        if (playNext(item))
          showToast({
            message: `${item?.name} will play next`,
            variant: "info",
          });
      },
    },
    {
      icon: "playlist-music",
      label: "Add to Queue",
      onPress: () => {
        if (addToQueue(item))
          showToast({
            message: `${item?.name} added to queue`,
            variant: "success",
          });
      },
    },
    ...playlistOption,
    ...(!isOffline
      ? [
          {
            icon: downloaded ? "download-off" : "download",
            label: downloaded
              ? "Remove download"
              : isDownloading(item?.id)
                ? "Downloading..."
                : "Download",
            onPress: () => {
              if (downloaded) {
                removeDownload(item.id);
              } else if (!isDownloading(item?.id)) {
                downloadSong(item);
              }
            },
          },
        ]
      : []),
    ...navigationOption,
    // {
    //   icon: "share-variant",
    //   label: "Share",
    //   onPress: handleShare,
    // },
  ];

  return (
    <>
      <Item
        onPress={() => handlePlaySong(item)}
        variant="default"
        className="px-0 py-2"
      >
        {!isAlbum && (
          <Item.Media className="rounded-xs" variant="image">
            <Image
              source={{ uri: item?.image?.[2]?.url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </Item.Media>
        )}

        <Item.Content>
          <View className="flex-row items-center gap-1">
            {playing && (
              <Image
                source={require("@/assets/images/gif1.gif")}
                style={{ width: 12, height: 12 }}
                resizeMode="contain"
              />
            )}
            <Item.Title
              className={`flex-1 font-normal ${playing && "text-primary"}`}
              numberOfLines={1}
            >
              {item?.name}
            </Item.Title>
          </View>
          <View className="flex-row items-center gap-1">
            {item?.explicit && (
              <MaterialIcons name="explicit" color="gray" size={16} />
            )}
            <Item.Description className="flex-1" numberOfLines={1}>
              {subtitle}
            </Item.Description>
          </View>
        </Item.Content>

        <Item.Actions className="gap-0">
          {showAddedToLiked && isSongInLibrary && !isOffline && (
            <Button size="sm" variant="ghost" onPress={toggleLiked}>
              <MaterialCommunityIcons
                name="check-circle"
                color="white"
                size={22}
              />
            </Button>
          )}

          <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <BottomSheet.Trigger>
              <Button size="sm" variant="ghost">
                <EllipsisVertical size={20} color="gray" />
              </Button>
            </BottomSheet.Trigger>
            <BottomSheet.Content showClose={false}>
              <View className="flex-row items-center gap-3 px-0 pb-3">
                <Image
                  source={{ uri: item?.image?.[2]?.url }}
                  style={{ width: 52, height: 52, borderRadius: 6 }}
                  resizeMode="cover"
                />
                <View className="flex-1 min-w-0">
                  <Text weight="semibold" numberOfLines={1}>
                    {item?.name}
                  </Text>
                  <Text
                    size="sm"
                    className="text-muted-foreground"
                    numberOfLines={1}
                  >
                    {subtitle}
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
                    <Item.Title className="font-normal">
                      {option.label}
                    </Item.Title>
                  </Item.Content>
                </Item>
              ))}
            </BottomSheet.Content>
          </BottomSheet>

          {showAddButton && !isOffline && (
            <Button size="sm" variant="ghost" onPress={toggleLiked}>
              <MaterialCommunityIcons
                name={isSongInLibrary ? "check-circle" : "plus-circle-outline"}
                color={isSongInLibrary ? ACCENT : "gray"}
                size={22}
              />
            </Button>
          )}
        </Item.Actions>
      </Item>

      {playlistMounted && (
        <PlaylistModal
          open={playlistOpen}
          onOpenChange={setPlaylistOpen}
          song={item}
        />
      )}
    </>
  );
};

export default Songs;
