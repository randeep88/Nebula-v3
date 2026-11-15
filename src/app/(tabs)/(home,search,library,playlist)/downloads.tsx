import { View } from "react-native";
import { useDownload } from "@/src/hooks/useDownload";
import { useDownloadStore } from "@/src/store/useDownloadStore";
import { Loader } from "panelui-native";
import DetailScreen from "@/components/custom/DetailScreen";

const DownloadsScreen = () => {
  const { downloadedSongs } = useDownload();

  const hasHydrated = useDownloadStore((s) => s.hasHydrated);

  if (!hasHydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Loader variant="bouncing-bars" color="white" />
      </View>
    );
  }

  return (
    <DetailScreen
      type="Playlist"
      title="My Downloads"
      localImage={require("../../../../assets/images/downloaded.jpg")}
      songs={downloadedSongs}
      emptyLabel="songs"
      emptyDescription="Download some to see them here."
    />
  );
};

export default DownloadsScreen;
