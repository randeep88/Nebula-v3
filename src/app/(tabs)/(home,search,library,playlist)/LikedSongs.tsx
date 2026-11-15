import { useMemo } from "react";
import DetailScreen from "@/components/custom/DetailScreen";
import { useLibrary } from "@/src/hooks/useLibrary";
import { View } from "react-native";
import { Loader } from "panelui-native";

const LikedSongs = () => {
  const { libraryItems, isLoading } = useLibrary();

  const songs = useMemo(
    () =>
      (libraryItems ?? [])
        .filter((item: any) => item.type === "song" && item.success)
        .map((item: any) => item.data?.[0])
        .filter(Boolean)
        .reverse(),
    [libraryItems],
  );

  if (isLoading) {
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
      type="Playlist"
      title="Liked Songs"
      localImage={require("../../../../assets/images/lb.png")}
      songs={songs}
      songProps={{ showAddButton: false }}
      isLoading={isLoading}
      emptyLabel="Liked Songs"
      emptyDescription="Tap the '+' icon on any song to add it here."
    />
  );
};

export default LikedSongs;
