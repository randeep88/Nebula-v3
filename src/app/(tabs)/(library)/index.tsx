import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import TitleBar from "@/components/custom/TitleBar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLibrary } from "@/src/hooks/useLibrary";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Button, Chip, Item, Loader, Separator } from "panelui-native";
import { ChevronRightIcon, Library, Search, X } from "lucide-react-native";
import LibraryItem from "@/components/custom/LibraryItem";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import OfflineState from "@/components/custom/OfflineState";
import EmptyView from "@/components/custom/EmptyView";

const tabs = [
  { label: "Artists", value: "artists" },
  { label: "Albums", value: "albums" },
  { label: "Playlists", value: "playlists" },
];

const getImage = (item: any) => item?.data?.image?.[2]?.url;

const Tabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  return (
    <View className="flex-row gap-2">
      {activeTab ? (
        <View className="flex-row gap-2">
          <Button
            size="xs"
            variant="secondary"
            onPress={() => setActiveTab("")}
            className="rounded-full"
          >
            <X size={16} color="white" />
          </Button>

          <Chip variant="primary">{activeTab}</Chip>
        </View>
      ) : null}

      {!activeTab &&
        tabs?.map((tab: any) => (
          <Chip key={tab?.value} onPress={() => setActiveTab(tab?.label)}>
            {tab?.label}
          </Chip>
        ))}
    </View>
  );
};

const LibraryContent = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const { libraryItems, refetch, isLoading } = useLibrary();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const { isOffline } = useNetworkStatus();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const items: any[] = libraryItems ?? [];

  const songs = items.filter((item) => item.type === "song");
  const withData = (type: string) =>
    items.filter((item) => item.type === type && !!item?.data).reverse();

  const albums = withData("album");
  const artists = withData("artist");
  const playlists = withData("playlist");

  const query = searchQuery.trim().toLowerCase();

  const filterByName = (list: any[]) =>
    list?.filter((item) => item?.data?.name?.toLowerCase().includes(query)) ??
    [];

  const artistList = query ? filterByName(artists) : artists;
  const albumList = query ? filterByName(albums) : albums;
  const playlistList = query ? filterByName(playlists) : playlists;

  const tabKey = activeTab.toLowerCase();
  const showLiked = !query && (tabKey === "songs" || tabKey === "");
  const showArtists = tabKey === "" || tabKey === "artists";
  const showAlbums = tabKey === "" || tabKey === "albums";
  const showPlaylists = tabKey === "" || tabKey === "playlists";

  const visibleCount =
    (showArtists ? artistList.length : 0) +
    (showAlbums ? albumList.length : 0) +
    (showPlaylists ? playlistList.length : 0);

  const nothingToShow = visibleCount === 0 && !showLiked;

  const isEmpty =
    !isLoading &&
    songs.length === 0 &&
    artists.length === 0 &&
    albums.length === 0 &&
    playlists.length === 0;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#00C0D0"
    />
  );

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 gap-4 pb-3" style={{ paddingTop: insets.top + 16 }}>
        <TitleBar
          tabLabel="Your Library"
          showSearch={!isEmpty}
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => {
            console.log("Library search:", searchQuery);
          }}
        />

        {!isLoading && !isOffline && !isEmpty && (
          <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </View>

      <Separator className="h-0.5 bg-black/50 shadow shadow-black" />

      {isOffline ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 160,
          }}
        >
          <View className="flex-1 h-full items-center justify-center py-30">
            <OfflineState message="Downloaded Songs are always available" />
            <View>
              <Item
                size="sm"
                variant="muted"
                onPress={() => router.push("/(tabs)/(library)/downloads")}
              >
                <Item.Media variant="image" className="rounded-sm">
                  <Image
                    source={{
                      uri: "https://i.pinimg.com/1200x/6d/de/54/6dde545af2d55bbd159f3239c101615d.jpg",
                    }}
                    style={{
                      width: 55,
                      height: 55,
                      borderRadius: 4,
                      backgroundColor: "#27272a",
                    }}
                  />
                </Item.Media>
                <Item.Content>
                  <Item.Title
                    numberOfLines={1}
                    className="text-white font-medium text-base"
                  >
                    Downloads
                  </Item.Title>
                </Item.Content>
                <Item.Actions>
                  <ChevronRightIcon color="white" />
                </Item.Actions>
              </Item>
            </View>
          </View>
        </ScrollView>
      ) : isLoading ? (
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
            icon={<Library size={18} color="gray" />}
            title="Your Library is empty"
            description="Save songs, artists, albums and playlists to find them all here."
            actions={[
              {
                label: "Explore music",
                icon: <Search size={18} color="white" />,
                onPress: () => router.push("/(tabs)/(search)"),
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
          <View>
            {showLiked && (
              <LibraryItem
                type="Playlist"
                extra={`${songs.length} ${songs.length === 1 ? "song" : "songs"}`}
                name="Liked Songs"
                localImage={require("../../../../assets/images/lb.png")}
                onPress={() => router.push("/(tabs)/(library)/LikedSongs")}
              />
            )}

            {showArtists && (
              <FlatList
                scrollEnabled={false}
                data={artistList}
                keyExtractor={(item) => item?.id}
                renderItem={({ item }) => (
                  <LibraryItem
                    type="Artist"
                    name={item?.data?.name}
                    uri={getImage(item)}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(library)/artist/[artistId]",
                        params: { artistId: item?.data?.id },
                      })
                    }
                  />
                )}
              />
            )}

            {showAlbums && (
              <FlatList
                scrollEnabled={false}
                data={albumList}
                keyExtractor={(item) => item?.id}
                renderItem={({ item }) => (
                  <LibraryItem
                    type="Album"
                    name={item?.data?.name}
                    uri={getImage(item)}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(library)/album/[albumId]",
                        params: { albumId: item?.data?.id },
                      })
                    }
                  />
                )}
              />
            )}

            {showPlaylists && (
              <FlatList
                scrollEnabled={false}
                data={playlistList}
                keyExtractor={(item) => item?.id}
                renderItem={({ item }) => (
                  <LibraryItem
                    type="Playlist"
                    name={item?.data?.name}
                    uri={getImage(item)}
                    onPress={() =>
                      router.push({
                        pathname: "/(tabs)/(library)/playlist/[playlistId]",
                        params: { playlistId: item?.data?.id },
                      })
                    }
                  />
                )}
              />
            )}

            {nothingToShow &&
              (query ? (
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
                <EmptyView
                  title={`No ${tabKey || "items"} yet`}
                  description="Things you save will show up here."
                  actions={[
                    {
                      label: "Show all",
                      variant: "secondary",
                      onPress: () => setActiveTab(""),
                    },
                  ]}
                />
              ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const LibraryScreen = () => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return (
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          paddingHorizontal: 20,
          paddingTop: 12,
        }}
      >
        <OfflineState
          message="Downloaded Songs are always available"
          showDownloads
        />
      </ScrollView>
    );
  }

  return <LibraryContent />;
};

export default LibraryScreen;
