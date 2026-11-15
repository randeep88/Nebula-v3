import { FlatList, RefreshControl, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowUp, ListMusic, ListVideo, Plus } from "lucide-react-native";
import TitleBar from "@/components/custom/TitleBar";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import OfflineState from "@/components/custom/OfflineState";
import { useCallback, useState } from "react";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import { Loader, Separator } from "panelui-native";
import { useRouter } from "expo-router";
import PlaylistItem from "@/components/custom/PlaylistItem";
import EmptyView from "@/components/custom/EmptyView";
import CreateMyPlaylistDialog from "@/components/custom/CreateMyPlaylistDialog";
import { ACCENT } from "../(search)";

const PlaylistContent = () => {
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { myPlaylists, loadingPlaylists, refetchPlaylists } = useMyPlaylist();
  const playlists: any[] = myPlaylists ?? [];
  const query = searchQuery.trim().toLowerCase();

  const filterByName = (items: any[]) =>
    items?.filter((item) => item?.name?.toLowerCase().includes(query)) ?? [];

  const filteredPlaylists = filterByName(playlists);

  const isEmpty = !loadingPlaylists && playlists.length === 0;
  const noMatches =
    !loadingPlaylists &&
    playlists.length > 0 &&
    !!query &&
    filteredPlaylists.length === 0;

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchPlaylists();
    setRefreshing(false);
  }, [refetchPlaylists]);

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={ACCENT}
    />
  );

  if (isOffline) return <OfflineState />;

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 gap-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
        <TitleBar
          tabLabel="My Playlists"
          tab="Playlist"
          showSearch={!isEmpty}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {
            console.log("Library search:", searchQuery);
          }}
        />
      </View>

      <Separator className="h-0.5 bg-black/50 shadow shadow-black" />

      <>
        {loadingPlaylists ? (
          <View className="flex-1 items-center justify-center">
            <Loader variant="bouncing-bars" color="white" />
          </View>
        ) : isEmpty ? (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
            refreshControl={refreshControl}
          >
            <EmptyView
              fill
              icon={<ListVideo size={18} color="gray" />}
              title="No playlists yet"
              description="Create your first playlist to keep the songs you love in one place."
              hint="You can also use the button at the top"
              hintIcon={<ArrowUp size={14} color="gray" />}
              actions={[
                {
                  label: "Create playlist",
                  icon: <Plus size={18} color="white" />,
                  onPress: () => setCreateOpen(true),
                },
              ]}
            />
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 160,
            }}
            refreshControl={refreshControl}
          >
            {noMatches ? (
              <EmptyView
                title={`No results for “${searchQuery.trim()}”`}
                description="Check the spelling or try a different name."
                actions={[
                  {
                    label: "Clear search",
                    variant: "secondary",
                    onPress: () => setSearchQuery(""),
                  },
                ]}
              />
            ) : (
              <View>
                <FlatList
                  scrollEnabled={false}
                  data={query ? filteredPlaylists : playlists}
                  keyExtractor={(item) => item?._id}
                  renderItem={({ item }) => (
                    <PlaylistItem
                      data={item}
                      onPress={() =>
                        router.push({
                          pathname:
                            "/(tabs)/(playlist)/myplaylist/[myplaylistId]",
                          params: { myplaylistId: item?._id },
                        })
                      }
                    />
                  )}
                />
              </View>
            )}
          </ScrollView>
        )}
      </>

      <CreateMyPlaylistDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        showTrigger={false}
      />
    </View>
  );
};

const PlaylistScreen = () => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return <OfflineState />;
  }

  return <PlaylistContent />;
};

export default PlaylistScreen;
