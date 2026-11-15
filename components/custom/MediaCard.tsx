import { Image, DimensionValue, View } from "react-native";
import { useRouter } from "expo-router";
import { Item } from "panelui-native";

type MediaType = "album" | "artist" | "playlist" | "song";

type MediaCardProps = {
  item: any;
  type: MediaType;
  width?: DimensionValue;
  isPlaying?: boolean;
  onPress?: () => void;
};

const getArtistName = (item: any) => {
  const artists = item?.artists?.primary;
  if (Array.isArray(artists) && artists.length > 0) {
    return artists.map((a: any) => a?.name).join(", ");
  }
  return item?.primaryArtists ?? "Unknown artist";
};

const config: Record<
  MediaType,
  { imageClass: string; getSubtitle: (item: any) => string }
> = {
  album: {
    imageClass: "rounded-md",
    getSubtitle: (item) => (item?.year ? `${item.year} • Album` : "Album"),
  },
  artist: {
    imageClass: "rounded-full",
    getSubtitle: () => "Artist",
  },
  playlist: {
    imageClass: "rounded-md",
    getSubtitle: () => "Playlist",
  },
  song: {
    imageClass: "rounded-md",
    getSubtitle: (item) => getArtistName(item),
  },
};

const MediaCard = ({
  item,
  type,
  width = "100%",
  isPlaying = false,
  onPress,
}: MediaCardProps) => {
  const router = useRouter();
  const { imageClass, getSubtitle } = config[type];
  const showPlaying = type === "song" && isPlaying;

  const handleRoute = () => {
    if (type === "artist") {
      router.push({
        pathname: "/(tabs)/(search)/artist/[artistId]",
        params: { artistId: item?.id },
      });
    } else if (type === "album") {
      router.push({
        pathname: "/(tabs)/(search)/album/[albumId]",
        params: { albumId: item?.id },
      });
    } else if (type === "playlist") {
      router.push({
        pathname: "/(tabs)/(search)/playlist/[playlistId]",
        params: { playlistId: item?.id },
      });
    }
  };

  return (
    <Item
      onPress={onPress ?? handleRoute}
      orientation="vertical"
      variant="default"
      className="items-start p-0 gap-0 border-0 bg-transparent"
      style={{ width }}
    >
      <Item.Media
        variant="image"
        className={`overflow-hidden ${imageClass}`}
        style={{ width: "100%", height: undefined, aspectRatio: 1 }}
      >
        <Image
          source={{ uri: item?.image?.[2]?.url }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </Item.Media>

      <Item.Content className="w-full min-w-0 px-0 pt-2 pb-0 items-start">
        <View className="flex-row items-center gap-1 w-full">
          {showPlaying && (
            <Image
              source={require("../../assets/images/gif1.gif")}
              style={{ width: 12, height: 12 }}
              resizeMode="contain"
            />
          )}
          <Item.Title
            className={`text-sm font-normal flex-1 text-left ${
              showPlaying ? "text-primary" : ""
            }`}
            numberOfLines={1}
          >
            {item?.name}
          </Item.Title>
        </View>
        <Item.Description
          className="text-xs w-full text-left"
          numberOfLines={1}
        >
          {getSubtitle(item)}
        </Item.Description>
      </Item.Content>
    </Item>
  );
};

export default MediaCard;
