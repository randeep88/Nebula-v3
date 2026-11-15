import { View, Text, Image } from "react-native";
import React from "react";
import { Item } from "panelui-native";
import { Pin } from "lucide-react-native";

type Props = {
  onPress: () => void;
  uri?: string;
  localImage?: any;
  name: string;
  type: string;
  extra?: any;
};

const LibraryItem = ({
  onPress,
  uri,
  name,
  type,
  localImage,
  extra,
}: Props) => {
  return (
    <Item className="px-0 py-2" onPress={onPress}>
      <Item.Media
        variant="image"
        className={`${type === "Artist" ? "rounded-full" : "rounded-sm"}`}
      >
        <Image
          source={localImage ? localImage : uri ? { uri } : undefined}
          style={{
            width: 55,
            height: 55,
            borderRadius: 4,
            backgroundColor: "#27272a",
          }}
        />
      </Item.Media>
      <Item.Content>
        <Item.Title numberOfLines={1} className="text-white font-normal">
          {name || "Unknown Artist"}
        </Item.Title>

        <Item.Description className="text-sm font-normal">
          {extra ? (
            <>
              {type} &bull; {extra}
            </>
          ) : (
            type
          )}
        </Item.Description>
      </Item.Content>
      {name === "Liked Songs" && (
        <Item.Actions>
          <Pin
            color="gray"
            size={18}
            fill="gray"
            style={{ transform: [{ rotate: "45deg" }] }}
          />
        </Item.Actions>
      )}
    </Item>
  );
};

export default LibraryItem;
