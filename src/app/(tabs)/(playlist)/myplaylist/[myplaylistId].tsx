import DetailScreen from "@/components/custom/DetailScreen";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import { useSongData } from "@/src/hooks/useSongData";
import { useLocalSearchParams } from "expo-router";
import { Loader } from "panelui-native";
import { View } from "react-native";

const MyPlaylistDetails = () => {
  const { myplaylistId } = useLocalSearchParams<{
    myplaylistId: string;
  }>();

  const { playlist, loadingPlaylist } = useMyPlaylist(myplaylistId);

  const { data: songDetails } = useSongData(
    playlist?.songs?.map((song: any) => {
      return song;
    }) || [],
  );

  if (loadingPlaylist) {
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

  return (
    <DetailScreen
      isLoading={loadingPlaylist}
      type="Playlist"
      title={playlist?.name ?? "Playlist"}
      uri={playlist?.coverImage}
      songs={songDetails ?? []}
      emptyLabel="songs"
      emptyDescription="You haven't added any song here."
      songProps={{ showRemoveFromPlaylist: true, playlistId: myplaylistId }}
    />
  );
};

export default MyPlaylistDetails;
