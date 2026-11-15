import DetailScreen from "@/components/custom/DetailScreen";
import { useAlbumData } from "@/src/hooks/useAlbumData";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useLocalSearchParams } from "expo-router";
import { Loader } from "panelui-native";
import { View } from "react-native";

const AlbumDetails = () => {
  const { albumId } = useLocalSearchParams<{
    albumId: string;
  }>();

  const {
    data: albumDetails,
    isPending,
    isError,
    error,
  } = useAlbumData(albumId);

  const { libraryItems, addAlbum, removeAlbum, isAddingSong, isRemovingSong } =
    useLibrary();

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
    console.log("Album Error:", error);
  }

  const songs = albumDetails?.songs ?? [];

  const inLibrary = !!libraryItems?.some(
    (entry) =>
      entry.type === "album" && entry.success && entry.id === albumId,
  );

  return (
    <DetailScreen
      type="Album"
      title={albumDetails?.name ?? "Album"}
      uri={albumDetails?.image?.[2]?.url}
      subtitle={[
        "Album",
        albumDetails?.year,
        `${songs.length} ${songs.length === 1 ? "song" : "songs"}`,
      ]
        .filter(Boolean)
        .join(" • ")}
      songs={songs}
      songProps={{ isAlbum: true }}
      inLibrary={inLibrary}
      libraryLoading={isAddingSong || isRemovingSong}
      onToggleLibrary={() =>
        inLibrary ? removeAlbum(albumId) : addAlbum(albumId)
      }
      emptyLabel="songs"
      emptyDescription="This album doesn't contain any songs."
    />
  );
};

export default AlbumDetails;