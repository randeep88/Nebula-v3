import { Image } from "react-native";
import { useRouter } from "expo-router";
import { Item } from "panelui-native";

const Playlists = ({ item }: { item: any }) => {
  const router = useRouter();
  return (
    <Item
      onPress={() => {}}
      orientation="vertical"
      variant="default"
      className="items-center p-0 w-34"
    >
      <Item.Media
        variant="image"
        className="w-33 h-33 aspect-square rounded-sm overflow-hidden"
      >
        <Image
          source={{ uri: item?.image?.[2]?.url }}
          className="w-full h-full"
          resizeMode="cover"
        />
      </Item.Media>

    <Item.Content className="w-full pb-2">
        <Item.Title className="text-sm leading-3" numberOfLines={1}>
          {item?.name}
        </Item.Title>
        <Item.Description className="text-sm" numberOfLines={1}>
          Playlist
        </Item.Description>
      </Item.Content>
    </Item>
  );
};

export default Playlists;
