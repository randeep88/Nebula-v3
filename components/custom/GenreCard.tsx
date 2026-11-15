import { Image, StyleSheet, View } from "react-native";
import { Item } from "panelui-native";

const GenreCard = ({
  item,
  setSearchQuery,
}: {
  item: any;
  setSearchQuery: (item: any) => void;
}) => {
  return (
    <Item
      size="sm"
      variant="muted"
      orientation="vertical"
      className="gap-2 p-0 border-0 overflow-hidden"
      onPress={() => setSearchQuery(item?.query)}
    >
      {item?.image ? (
        <Image
          source={{ uri: item?.image }}
          blurRadius={120}
          resizeMode="cover"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Item.Content className="flex-1 min-w-0 flex-row items-center justify-between gap-2 overflow-hidden">
        <Item.Title
          numberOfLines={2}
          className="flex-1 min-w-0 text-base text-left p-2"
        >
          {item.label}
        </Item.Title>

        <Image
          source={{
            uri: item?.image ? String(item.image) : undefined,
          }}
          className="rotate-30"
          style={{
            width: 55,
            height: 55,
            flexShrink: 0,
            borderRadius: 10,
            resizeMode: "cover",
          }}
        />
      </Item.Content>
    </Item>
  );
};

export default GenreCard;
