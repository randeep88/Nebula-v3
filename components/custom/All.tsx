import { memo, useMemo } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Button, Item, ScrollFade } from "panelui-native";
import Songs from "./Songs";
import MediaCard from "./MediaCard";
import { ResultKind, rankSearchResults } from "@/src/utils/searchRanking";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { usePlayer } from "@/src/hooks/usePlayer";
import { useRouter } from "expo-router";

const SECTION_TITLES: Record<ResultKind, string> = {
  song: "Songs",
  artist: "Artists",
  album: "Albums",
  playlist: "Playlists",
};

const subtitleOf = (kind: ResultKind, item: any) => {
  if (kind === "song") return item?.artists?.primary?.[0]?.name;
  if (kind === "album") return item?.year ? `Album · ${item.year}` : "Album";
  if (kind === "artist") return "Artist";
  return "Playlist";
};

const HorizontalSection = memo(
  ({
    title,
    data,
    type,
    cardWidth,
  }: {
    title: string;
    data: any[];
    type: "artist" | "album" | "playlist";
    cardWidth: number;
  }) => (
    <View className="mb-5">
      <Text className="text-white font-bold text-lg mb-1">{title}</Text>
      <ScrollFade size={10}>
        <FlatList
          horizontal
          data={data}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
          keyExtractor={(item, index) => item.id ?? String(index)}
          renderItem={({ item }) => (
            <MediaCard item={item} width={cardWidth} type={type} />
          )}
        />
      </ScrollFade>
    </View>
  ),
);

const All = ({
  data,
  query,
  handlePlaySong,
}: {
  data: any;
  query: string;
  handlePlaySong: (song: any) => void;
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(140, width * 0.4);

  const { playSong, isSongPlaying } = usePlayer();

  const { top, kinds, lists } = useMemo(
    () => rankSearchResults(data, query),
    [data, query],
  );

  const handleTopRoute = () => {
    if (!top || top.kind === "song") return;

    if (top.kind === "artist") {
      router.push({
        pathname: "/(tabs)/(search)/artist/[artistId]",
        params: { artistId: top?.item?.id },
      });
    } else if (top.kind === "album") {
      router.push({
        pathname: "/(tabs)/(search)/album/[albumId]",
        params: { albumId: top?.item?.id },
      });
    } else if (top.kind === "playlist") {
      router.push({
        pathname: "/(tabs)/(search)/playlist/[playlistId]",
        params: { playlistId: top?.item?.id },
      });
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      {top && (
        <View className="mb-5">
          <Text className="text-white font-bold text-lg mb-1">Top Result</Text>

          <Item onPress={handleTopRoute} variant="muted" className="p-2">
            <Item.Media
              className={`size-17 ${top.kind === "artist" ? "rounded-full" : ""}`}
              variant="image"
            >
              <Image
                source={{ uri: top.item?.image?.[2]?.url }}
                className="w-full h-full"
                resizeMode="cover"
              />
            </Item.Media>

            <Item.Content>
              <Item.Title numberOfLines={1} className="text-lg font-semibold">
                {top.item?.name}
              </Item.Title>
              <Item.Description numberOfLines={1}>
                {subtitleOf(top.kind, top.item)}
              </Item.Description>
            </Item.Content>
            {top.kind === "song" && (
              <Item.Actions>
                <Button
                  variant="ghost"
                  className="rounded-full p-0"
                  onPress={() => playSong(top?.item, data?.songs)}
                >
                  <MaterialCommunityIcons
                    name={
                      isSongPlaying(top.item) ? "pause-circle" : "play-circle"
                    }
                    color="white"
                    size={50}
                  />
                </Button>
              </Item.Actions>
            )}
          </Item>
        </View>
      )}

      {kinds.map((kind) => {
        const items = lists[kind]
          .filter((entry) => entry !== top)
          .map((entry) => entry.item);

        if (items.length === 0) return null;

        if (kind === "song") {
          return (
            <View key={kind} className="mb-5">
              <Text className="text-white font-bold text-lg mb-1">
                {SECTION_TITLES[kind]}
              </Text>
              {items.slice(0, 6).map((song: any, index: number) => (
                <Songs
                  key={song.id ?? String(index)}
                  item={song}
                  handlePlaySong={handlePlaySong}
                />
              ))}
            </View>
          );
        }

        return (
          <HorizontalSection
            key={kind}
            title={SECTION_TITLES[kind]}
            data={kind === "artist" ? items : items.slice(0, 6)}
            type={kind}
            cardWidth={cardWidth}
          />
        );
      })}
    </ScrollView>
  );
};

export default All;
