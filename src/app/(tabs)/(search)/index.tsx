import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Keyboard,
  useWindowDimensions,
  View,
} from "react-native";

import { Chip, Loader, Text } from "panelui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Searchbar from "@/components/custom/Searchbar";
import useLastPlayedSong from "@/src/hooks/useLastPlayedSong";
import { useDebounce } from "@/src/hooks/useDebounce";
import { useSearchResults } from "@/src/hooks/useSearchResults";
import GenreCard from "@/components/custom/GenreCard";
import TitleBar from "@/components/custom/TitleBar";
import All from "@/components/custom/All";
import Songs from "@/components/custom/Songs";
import MediaCard from "@/components/custom/MediaCard";
import SearchSuggestions, {
  Suggestion,
  buildSuggestions,
} from "@/components/custom/SearchSuggestions";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { usePlayer } from "@/src/hooks/usePlayer";
import TrendingSearchCard from "@/components/custom/TrendingSearchCard";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import OfflineState from "@/components/custom/OfflineState";
import { Empty } from "@/components/custom/EmptyView";

export let ACCENT = "#007BFD";

const LoaderIcon = () => (
  <View className="h-full py-50">
    <Loader variant="bouncing-bars" color="white" className="h-full w-full" />
  </View>
);

const tabs = [
  { label: "All", value: "all" },
  { label: "Songs", value: "songs" },
  { label: "Artists", value: "artists" },
  { label: "Albums", value: "albums" },
  { label: "Playlists", value: "playlists" },
];

const genres = [
  {
    label: "Punjabi",
    query: "Punjabi Songs",
    color: "#1C4A1C",
    image:
      "https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg",
  },
  {
    label: "Haryanvi",
    query: "Haryanvi Songs",
    color: "#4A3800",
    image:
      "https://c.saavncdn.com/artists/Dhanda_Nyoliwala_000_20240820133551_500x500.jpg",
  },
  {
    label: "90s",
    query: "90s Hits",
    color: "#3D2600",
    image:
      "https://i.pinimg.com/736x/5d/68/57/5d68577ab52e558f8489f788cfb53b8b.jpg",
  },
  {
    label: "Indie",
    query: "Indian Indie Songs",
    color: "#243B35",
    image:
      "https://i.pinimg.com/736x/da/77/60/da77600c7c33b669b37696748a7c27fe.jpg",
  },
  {
    label: "English",
    query: "English Songs",
    color: "#0A1F4A",
    image:
      "https://c.saavncdn.com/artists/Billie_Eilish_20190211151539_500x500.jpg",
  },
  {
    label: "Sad",
    query: "Sad Songs",
    color: "#151528",
    image:
      "https://thumbs.dreamstime.com/b/anime-style-portrait-girl-headphones-eps-vector-format-90321795.jpg?w=768",
  },
  {
    label: "Party",
    query: "Party Songs",
    color: "#4A004A",
    image:
      "https://c.saavncdn.com/artists/Yo_Yo_Honey_Singh_002_20221216102650_500x500.jpg",
  },
  {
    label: "Romantic",
    query: "Romantic Songs",
    color: "#4A0A1E",
    image: "https://thumbs.dreamstime.com/b/romantic-couple-7700160.jpg?w=768",
  },
  {
    label: "Workout",
    query: "Workout Songs",
    color: "#4A1A00",
    image:
      "https://thumbs.dreamstime.com/b/muscle-athlete-man-gym-making-pull-up-elevations-bodybuilder-training-57930636.jpg?w=992",
  },
  {
    label: "Lofi",
    query: "Lofi Songs",
    color: "#0A2A35",
    image:
      "https://c.saavncdn.com/artists/Vishal_Mishra_005_20251120085316_500x500.jpg",
  },
];

export const trendingSearches = [
  {
    label: "Sidhu Moose Wala",
    type: "Artist",
    query: "Sidhu Moose Wala",
    color: "#E6B422",
  },
  {
    label: "Karan Aujla",
    type: "Artist",
    query: "Karan Aujla",
    color: "#E56B3F",
  },
  {
    label: "Arijit Singh",
    type: "Artist",
    query: "Arijit Singh",
    color: "#A78BFA",
  },
  {
    label: "AUJLA SZN 1",
    type: "Album",
    query: "AUJLA SZN 1",
    color: "#F59E0B",
  },
  {
    label: "Moosetape",
    type: "Album",
    query: "Moosetape",
    color: "#22A06B",
  },
  {
    label: "Aashiqui 2",
    type: "Album",
    query: "Aashiqui 2",
    color: "#EC4899",
  },
  {
    label: "Punjabi Hits",
    type: "Playlist",
    query: "Punjabi Hits",
    color: "#06B6D4",
  },
  {
    label: "Bollywood Romance",
    type: "Playlist",
    query: "Bollywood Romance",
    color: "#F472B6",
  },
];

const typeByTab = {
  albums: "album",
  artists: "artist",
  playlists: "playlist",
} as any;

const GENERIC_WORDS = new Set([
  "song",
  "songs",
  "hit",
  "hits",
  "music",
  "best",
  "top",
  "new",
  "latest",
  "playlist",
  "playlists",
  "album",
  "albums",
]);

const RESULT_KEYS = ["songs", "albums", "artists", "playlists"];

const toArray = (value: any) =>
  Array.isArray(value) ? value : value ? [value] : [];

const hasAnyResults = (data: any) =>
  !!data && RESULT_KEYS.some((key) => toArray(data?.[key]).length > 0);

const simplifyQuery = (query: string) =>
  query
    .split(/\s+/)
    .filter((word) => !GENERIC_WORDS.has(word.toLowerCase()))
    .join(" ")
    .trim();

function SearchContent() {
  const { isOffline } = useNetworkStatus();
  if (isOffline) return <OfflineState />;
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, 48],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const titleTranslate = scrollY.interpolate({
    inputRange: [0, 48],
    outputRange: [0, -10],
    extrapolate: "clamp",
  });
  const { width: screenWidth } = useWindowDimensions();

  const gap = 12;
  const itemWidth = (screenWidth - 32 - gap) / 2;

  const { updateLastPlayedSong } = useLastPlayedSong();
  const { playSong } = usePlayer();

  const searchQuery = usePlayerStore((state) => state.searchQuery);
  const setSearchQuery = usePlayerStore((state) => state.setSearchQuery);

  const [activeTab, setActiveTab] = useState("all");
  const [inputValue, setInputValue] = useState(searchQuery);

  const trimmed = inputValue.trim();
  const debouncedInput = useDebounce(trimmed, 300);

  const suggestionsOpen = trimmed.length > 0 && trimmed !== searchQuery;
  const suggestionQuery = suggestionsOpen ? debouncedInput : "";

  const { data: suggestionData, isFetching: suggestionsFetching } =
    useSearchResults(suggestionQuery);

  const builtSuggestions = useMemo(
    () => (suggestionData ? buildSuggestions(suggestionData) : null),
    [suggestionData],
  );

  const lastSuggestions = useRef<Suggestion[]>([]);

  if (builtSuggestions) lastSuggestions.current = builtSuggestions;

  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!trimmed && searchQuery) setSearchQuery("");
  }, [trimmed]);

  const commitSearch = (value: string) => {
    const query = value.trim();

    if (!query) return;

    setInputValue(query);
    setSearchQuery(query);
    setActiveTab("all");
    Keyboard.dismiss();
  };

  const { data, isPending, isFetching } = useSearchResults(searchQuery);

  const primaryHasResults = hasAnyResults(data);

  const simplified = simplifyQuery(searchQuery);

  const fallbackQuery =
    searchQuery &&
    !isPending &&
    !isFetching &&
    !primaryHasResults &&
    simplified &&
    simplified.toLowerCase() !== searchQuery.toLowerCase()
      ? simplified
      : "";

  const { data: fallbackData, isFetching: fallbackFetching } =
    useSearchResults(fallbackQuery);

  const fallbackHasResults = !!fallbackQuery && hasAnyResults(fallbackData);

  const showingFallback =
    !!searchQuery && !primaryHasResults && fallbackHasResults;

  const musicData = !searchQuery
    ? undefined
    : primaryHasResults
      ? data
      : fallbackHasResults
        ? fallbackData
        : undefined;

  const effectiveQuery = showingFallback ? fallbackQuery : searchQuery;

  const songs = toArray(musicData?.songs);
  const albums = toArray(musicData?.albums);
  const artists = toArray(musicData?.artists);
  const similarArtists = toArray(musicData?.artists?.similarArtists);
  const playlists = toArray(musicData?.playlists);

  const activeData =
    activeTab === "songs"
      ? songs
      : activeTab === "albums"
        ? albums
        : activeTab === "artists"
          ? [...artists, ...similarArtists]
          : activeTab === "playlists"
            ? playlists
            : [];

  const handlePlaySong = (song: any) => {
    playSong(song, songs);
    updateLastPlayedSong(song?.id);
  };

  const browse = (note?: string) => (
    <View className="gap-6">
      {note ? (
        <Text size="sm" className="text-muted-foreground">
          {note}
        </Text>
      ) : null}

      <FlatList
        scrollEnabled={false}
        data={genres}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Text size="xl" weight="semibold" className="mb-1">
            Browse by mood
          </Text>
        }
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12 }}
        keyExtractor={(item) => item.label}
        renderItem={({ item }) => (
          <View style={{ width: "48%" }}>
            <GenreCard item={item} setSearchQuery={commitSearch} />
          </View>
        )}
      />

      <View className="gap-3 pb-6">
        <Text size="xl" weight="semibold" className="mb-1">
          Trending Searches
        </Text>

        <View className="flex-row flex-wrap gap-3">
          {trendingSearches.map((item) => (
            <TrendingSearchCard
              key={item.label}
              item={item}
              setSearchQuery={commitSearch}
            />
          ))}
        </View>
      </View>
    </View>
  );

  let body;

  if (suggestionsOpen) {
    body = (
      <SearchSuggestions
        input={trimmed}
        suggestions={lastSuggestions.current}
        loading={debouncedInput !== trimmed || suggestionsFetching}
        onSelect={commitSearch}
      />
    );
  } else if (!searchQuery) {
    body = browse();
  } else if (!musicData) {
    body =
      isPending || isFetching || fallbackFetching ? (
        <LoaderIcon />
      ) : (
        browse(`No results for “${searchQuery}”. Try something else:`)
      );
  } else if (activeTab === "all") {
    body = (
      <All
        data={musicData}
        query={effectiveQuery}
        handlePlaySong={handlePlaySong}
      />
    );
  } else if (activeTab === "songs") {
    body =
      songs.length === 0 ? (
        <Empty label={activeTab} />
      ) : (
        <FlatList
          scrollEnabled={false}
          data={songs}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
          keyExtractor={(item, index) => item.id ?? String(index)}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          renderItem={({ item }) => (
            <Songs item={item} handlePlaySong={handlePlaySong} />
          )}
        />
      );
  } else {
    body =
      activeData.length === 0 ? (
        <Empty label={activeTab} />
      ) : (
        <FlatList
          scrollEnabled={false}
          key={activeTab}
          data={activeData}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={{ gap }}
          contentContainerStyle={{ paddingBottom: 24, gap }}
          keyExtractor={(item, index) => item.id ?? String(index)}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={5}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews
          renderItem={({ item }) => (
            <MediaCard
              width={itemWidth}
              item={item}
              type={typeByTab[activeTab as keyof typeof typeByTab]}
            />
          )}
        />
      );
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <Animated.ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true },
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
      >
        <Animated.View
          style={{
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslate }],
          }}
        >
          <View className="pt-4 pb-1">
            <TitleBar tabLabel="Search" />
          </View>
        </Animated.View>

        <View className="bg-background pt-2 pb-3">
          <Searchbar
            value={inputValue}
            onChange={setInputValue}
            onSubmit={() => commitSearch(inputValue)}
          />
        </View>

        {!suggestionsOpen && musicData && (
          <View className="flex-row flex-wrap justify-between pb-3">
            {tabs.map((tab) => (
              <Chip
                key={tab.value}
                variant={tab.value === activeTab ? "primary" : "default"}
                onPress={() => setActiveTab(tab.value)}
              >
                {tab.label}
              </Chip>
            ))}
          </View>
        )}

        {showingFallback && !suggestionsOpen ? (
          <Text size="sm" className="text-muted-foreground mb-2">
            Showing results for “{fallbackQuery}”
          </Text>
        ) : null}

        {body}
      </Animated.ScrollView>
    </View>
  );
}

const SearchScreen = () => {
  const { isOffline } = useNetworkStatus();

  if (isOffline) {
    return <OfflineState />;
  }

  return <SearchContent />;
};

export default SearchScreen;
