import { Image, DimensionValue } from "react-native";
import { useRouter } from "expo-router";
import { Item } from "panelui-native";

type AlbumsProps = {
  item: any;
  width?: DimensionValue;
};

const Albums = ({ item, width = "100%" }: AlbumsProps) => {
  const router = useRouter();

  const subtitle = item?.year ? `${item.year} • Album` : "Album";

  return (
    <Item
      onPress={() => {}}
      orientation="vertical"
      variant="default"
      className="items-start p-2 gap-0 border-0 bg-transparent"
      style={{ width }}
    >
      <Item.Media
        variant="image"
        className="rounded-md overflow-hidden"
        style={{ width: "100%", height: undefined, aspectRatio: 1 }}
      >
        <Image
          source={{ uri: item?.image?.[2]?.url }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </Item.Media>

      <Item.Content className="w-full min-w-0 px-0 pt-2 pb-0 items-start">
        <Item.Title
          className="text-sm font-semibold w-full text-left"
          numberOfLines={1}
        >
          {item?.name}
        </Item.Title>
        <Item.Description
          className="text-xs w-full text-left"
          numberOfLines={1}
        >
          {subtitle}
        </Item.Description>
      </Item.Content>
    </Item>
  );
};

export default Albums;