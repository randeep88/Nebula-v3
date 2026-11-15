import { memo } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Search } from "lucide-react-native";
import { Text } from "panelui-native";

export type SuggestionType = "song" | "artist" | "album" | "playlist";

export type Suggestion = {
  key: string;
  type: SuggestionType;
  title: string;
  subtitle: string;
  image?: string;
  query: string;
};

const toArray = (value: any) =>
  Array.isArray(value) ? value : value ? [value] : [];

const imageOf = (item: any): string | undefined =>
  item?.image?.[2]?.url ?? item?.image?.[1]?.url ?? item?.image?.[0]?.url;

export const buildSuggestions = (data: any): Suggestion[] => {
  const result: Suggestion[] = [];

  toArray(data?.artists)
    .slice(0, 2)
    .forEach((item: any, i: number) => {
      if (!item?.name) return;
      result.push({
        key: `artist-${item.id ?? i}`,
        type: "artist",
        title: item.name,
        subtitle: "Artist",
        image: imageOf(item),
        query: item.name,
      });
    });

  toArray(data?.songs)
    .slice(0, 4)
    .forEach((item: any, i: number) => {
      if (!item?.name) return;
      const artist = item?.artists?.primary?.[0]?.name;
      result.push({
        key: `song-${item.id ?? i}`,
        type: "song",
        title: item.name,
        subtitle: artist ? `Song · ${artist}` : "Song",
        image: imageOf(item),
        query: artist ? `${item.name} ${artist}` : item.name,
      });
    });

  toArray(data?.albums)
    .slice(0, 2)
    .forEach((item: any, i: number) => {
      if (!item?.name) return;
      result.push({
        key: `album-${item.id ?? i}`,
        type: "album",
        title: item.name,
        subtitle: item?.year ? `Album · ${item.year}` : "Album",
        image: imageOf(item),
        query: item.name,
      });
    });

  toArray(data?.playlists)
    .slice(0, 2)
    .forEach((item: any, i: number) => {
      if (!item?.name) return;
      result.push({
        key: `playlist-${item.id ?? i}`,
        type: "playlist",
        title: item.name,
        subtitle: "Playlist",
        image: imageOf(item),
        query: item.name,
      });
    });

  return result;
};

type RowProps = {
  item: Suggestion;
  onSelect: (query: string) => void;
};

const Row = memo(({ item, onSelect }: RowProps) => (
  <Pressable
    className="flex-row items-center gap-3 py-2"
    onPress={() => onSelect(item.query)}
  >
    <Image
      source={{ uri: item.image }}
      resizeMode="cover"
      style={{
        width: 44,
        height: 44,
        borderRadius: item.type === "artist" ? 22 : 6,
        backgroundColor: "#27272a",
      }}
    />
    <View className="flex-1 min-w-0">
      <Text size="sm" weight="normal" numberOfLines={1}>
        {item.title}
      </Text>
      <Text size="xs" className="text-muted-foreground" numberOfLines={1}>
        {item.subtitle}
      </Text>
    </View>
  </Pressable>
));

type SearchSuggestionsProps = {
  input: string;
  suggestions: Suggestion[];
  loading: boolean;
  onSelect: (query: string) => void;
};

const SearchSuggestions = ({
  input,
  suggestions,
  loading,
  onSelect,
}: SearchSuggestionsProps) => (
  <ScrollView
    className="flex-1"
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
    keyboardDismissMode="on-drag"
    contentContainerStyle={{ paddingBottom: 120 }}
  >
    <Pressable
      className="flex-row items-center gap-3 py-2"
      onPress={() => onSelect(input)}
    >
      <View className="size-11 items-center justify-center rounded-md bg-muted">
        <Search size={20} color="gray" />
      </View>
      <Text className="flex-1" numberOfLines={1}>
        Search for “{input}”
      </Text>
    </Pressable>

    {loading && suggestions.length === 0 ? (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color="#00C0D0" />
      </View>
    ) : (
      suggestions.map((item) => (
        <Row key={item.key} item={item} onSelect={onSelect} />
      ))
    )}
  </ScrollView>
);

export default memo(SearchSuggestions);
