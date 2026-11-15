import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Button, Loader, ScrollFade, ScrollHeader } from "panelui-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Shuffle } from "lucide-react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import { useCSSVariable } from "uniwind";
import Songs from "./Songs";
import MediaCard from "./MediaCard";
import { usePlayer } from "@/src/hooks/usePlayer";
import useLastPlayedSong from "@/src/hooks/useLastPlayedSong";
import { Empty } from "./EmptyView";

type SongRowProps = {
  isAlbum?: boolean;
  isArtist?: boolean;
  showAddButton?: boolean;
  showAddedToLiked?: boolean;
  playlistId?: string;
  showRemoveFromPlaylist?: boolean;
};

export type DetailSection = {
  title: string;
  type: "album" | "artist" | "playlist";
  data: any[];
  onPressItem?: (item: any) => void;
};

type Props = {
  type: string;
  title: string;
  uri?: string;
  localImage?: any;
  songs: any[];
  isLoading?: boolean;
  subtitle?: string;
  verified?: boolean;
  inLibrary?: boolean;
  onToggleLibrary?: () => void;
  libraryLoading?: boolean;
  songsTitle?: string;
  songProps?: SongRowProps;
  sections?: DetailSection[];
  emptyLabel?: string;
  emptyDescription?: string;
};

const DetailScreen = ({
  type,
  title,
  uri,
  localImage,
  songs,
  isLoading = false,
  subtitle,
  verified = false,
  inLibrary = false,
  onToggleLibrary,
  libraryLoading = false,
  songsTitle,
  songProps,
  sections,
  emptyLabel = "songs",
  emptyDescription,
}: Props) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const cardWidth = Math.max(140, width * 0.4);
  const accent = (useCSSVariable("--color-primary") as string) ?? "#00C0D0";

  const { playSong, playShuffled, togglePlayPause, playing, currentSong } =
    usePlayer();
  const { updateLastPlayedSong } = useLastPlayedSong();

  const imageSource = localImage ? localImage : uri ? { uri } : undefined;
  const songList = songs ?? [];
  const isCurrentList = songList.some(
    (song: any) => song?.id && song.id === currentSong?.id,
  );
  const visibleSections = (sections ?? []).filter(
    (section) => section.data?.length > 0,
  );

  const handlePlaySong = (song: any) => {
    playSong(song, songList);
    updateLastPlayedSong(song?.id);
  };

  const handlePlayPress = () => {
    if (isCurrentList) togglePlayPause();
    else if (songList.length > 0) handlePlaySong(songList[0]);
  };

  return (
    <ScrollHeader
      threshold={1}
      barHeight={60}
      snap
      inset
      stretch
      className="flex-1"
    >
      <ScrollHeader.Cover scrim={false}>
        <Image
          source={imageSource}
          blurRadius={35}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />

        <LinearGradient
          colors={[
            "rgba(19,19,20,0)",
            "rgba(19,19,20,0.15)",
            "rgba(19,19,20,0.55)",
            "#131314",
          ]}
          locations={[0, 0.4, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />
      </ScrollHeader.Cover>

      <ScrollHeader.Bar surface="muted" divider={false}>
        <Button
          onPress={() => router.back()}
          variant="secondary"
          className="rounded-full size-5"
        >
          <ArrowLeft color="white" size={20} />
        </Button>

        <ScrollHeader.Title className="text-center text-lg">
          {title}
        </ScrollHeader.Title>
        <Button variant="ghost" size="sm"></Button>
      </ScrollHeader.Bar>

      <ScrollHeader.Large className="min-h-70 justify-end pb-5">
        <View className="flex-1 items-center justify-center">
          <Image
            source={imageSource}
            style={{
              width: 190,
              height: 190,
              borderRadius: 12,
            }}
            resizeMode="cover"
          />
        </View>

        <View className="mt-5 flex-row items-center justify-between">
          <View className="flex-1 min-w-0 pr-2">
            <ScrollHeader.Title
              numberOfLines={3}
              className="text-white text-2xl"
            >
              {title}
            </ScrollHeader.Title>

            <View className="flex-row items-center gap-1">
              {verified && (
                <MaterialIcons name="verified" color="#3b82f6" size={15} />
              )}
              <ScrollHeader.Description className="text-white/60">
                {subtitle ??
                  `${type} • ${songList.length} ${songList.length === 1 ? "song" : "songs"}`}
              </ScrollHeader.Description>
            </View>
          </View>

          <View className="flex-row items-center justify-end gap-1">
            {onToggleLibrary && (
              <Button
                variant="ghost"
                className="rounded-full p-0"
                disabled={libraryLoading}
                onPress={onToggleLibrary}
              >
                <MaterialCommunityIcons
                  name={inLibrary ? "check-circle" : "plus-circle-outline"}
                  color={inLibrary ? accent : "white"}
                  size={32}
                />
              </Button>
            )}

            {songList.length > 1 && (
              <Button
                variant="ghost"
                className="rounded-full p-0"
                onPress={() => playShuffled(songList)}
              >
                <Shuffle size={24} color="white" />
              </Button>
            )}

            <Button
              variant="ghost"
              className="rounded-full p-0"
              disabled={songList.length === 0}
              onPress={handlePlayPress}
            >
              <MaterialCommunityIcons
                name={isCurrentList && playing ? "pause-circle" : "play-circle"}
                color="white"
                size={60}
              />
            </Button>
          </View>
        </View>
      </ScrollHeader.Large>

      <ScrollView
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingBottom: 160,
          paddingHorizontal: 16,
          gap: 20,
        }}
      >
        {isLoading ? (
          <View className="h-full py-20">
            <Loader
              variant="bouncing-bars"
              color="white"
              className="h-full w-full"
            />
          </View>
        ) : songList.length === 0 && visibleSections.length === 0 ? (
          <Empty description={emptyDescription} label={emptyLabel} />
        ) : (
          <>
            {songList.length > 0 && (
              <View>
                {songsTitle ? (
                  <Text className="text-white font-bold text-lg mb-1">
                    {songsTitle}
                  </Text>
                ) : null}
                <FlatList
                  scrollEnabled={false}
                  data={songList}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  keyExtractor={(item, index) => item.id ?? String(index)}
                  renderItem={({ item }) => (
                    <Songs
                      item={item}
                      handlePlaySong={handlePlaySong}
                      {...songProps}
                    />
                  )}
                />
              </View>
            )}

            {visibleSections.map((section) => (
              <View key={section.title}>
                <Text className="text-white font-bold text-lg mb-1">
                  {section.title}
                </Text>
                <ScrollFade size={10}>
                  <FlatList
                    horizontal
                    data={section.data}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 12 }}
                    keyExtractor={(item, index) => item.id ?? String(index)}
                    renderItem={({ item }) => (
                      <MediaCard
                        item={item}
                        type={section.type}
                        width={cardWidth}
                        onPress={() => section.onPressItem?.(item)}
                      />
                    )}
                  />
                </ScrollFade>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScrollHeader>
  );
};

export default DetailScreen;
