import DetailScreen from "@/components/custom/DetailScreen";
import { useLibrary } from "@/src/hooks/useLibrary";
import { usePlaylistData } from "@/src/hooks/usePlaylistData";
import { useLocalSearchParams } from "expo-router";
import { Loader } from "panelui-native";
import { View } from "react-native";

const PlaylistDetails = () => {
  const { playlistId } = useLocalSearchParams<{
    playlistId: string;
  }>();

  const {
    data: playlistDetails,
    isPending,
    isError,
    error,
  } = usePlaylistData(playlistId);

  const {
    libraryItems,
    addPlaylist,
    removePlaylist,
    isAddingSong,
    isRemovingSong,
  } = useLibrary();

  if (isPending) {
    return (
      <View className="h-full">
        <Loader
          variant="bouncing-bars"
          color="white"
          className="h-full w-full"
        />
      </View>
    );
  }

  if (isError) {
    console.log("Playlist Error:", error);
  }

  const inLibrary = !!libraryItems?.some(
    (entry) =>
      entry.type === "playlist" && entry.success && entry.id === playlistId,
  );

  return (
    <DetailScreen
      type="Playlist"
      title={playlistDetails?.name ?? "Playlist"}
      uri={playlistDetails?.image?.[2]?.url}
      songs={playlistDetails?.songs ?? []}
      inLibrary={inLibrary}
      libraryLoading={isAddingSong || isRemovingSong}
      onToggleLibrary={() =>
        inLibrary ? removePlaylist(playlistId) : addPlaylist(playlistId)
      }
      emptyLabel="songs"
      emptyDescription="This playlist doesn't contain any songs."
    />
  );
};

export default PlaylistDetails;
