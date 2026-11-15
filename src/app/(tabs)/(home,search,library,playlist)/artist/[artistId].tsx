import DetailScreen from "@/components/custom/DetailScreen";
import { useArtistData } from "@/src/hooks/useArtistData";
import { useLibrary } from "@/src/hooks/useLibrary";
import { formatNumbers } from "@/src/utils/formatNumbers";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Loader } from "panelui-native";
import { View } from "react-native";

const ArtistDetails = () => {
  const router = useRouter();
  const { artistId } = useLocalSearchParams<{ artistId: string }>();
  const { data: artist, isPending } = useArtistData(artistId);
  const { libraryItems, addArtist, removeArtist } = useLibrary();

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

  const inLibrary = !!libraryItems?.some(
    (entry) =>
      entry.type === "artist" && entry.success && entry.id === artistId,
  );

  return (
    <DetailScreen
      type="Artist"
      title={artist?.name ?? "Artist"}
      uri={artist?.image?.[2]?.url}
      verified={artist?.isVerified}
      subtitle={`Artist • ${formatNumbers(Number(artist?.followerCount))} listeners`}
      songs={artist?.topSongs ?? artist?.songs ?? []}
      songsTitle="Popular"
      songProps={{ isArtist: true, showAddButton: false }}
      inLibrary={inLibrary}
      onToggleLibrary={() =>
        inLibrary ? removeArtist(artistId) : addArtist(artistId)
      }
      sections={[
        {
          title: "Singles",
          type: "album",
          data: artist?.singles ?? [],
          onPressItem: (item) =>
            router.push({
              pathname: "/album/[albumId]",
              params: { albumId: item.id },
            }),
        },
        {
          title: "Top Albums",
          type: "album",
          data: artist?.topAlbums ?? [],
          onPressItem: (item) =>
            router.push({
              pathname: "/album/[albumId]",
              params: { albumId: item.id },
            }),
        },
        {
          title: "Similar Artists",
          type: "artist",
          data: artist?.similarArtists ?? [],
          onPressItem: (item) =>
            router.push({
              pathname: "/artist/[artistId]",
              params: { artistId: item.id },
            }),
        },
      ]}
    />
  );
};

export default ArtistDetails;
