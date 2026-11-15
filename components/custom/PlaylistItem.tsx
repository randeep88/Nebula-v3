import { View, Image, Text } from "react-native";
import { BottomSheet, Button, Item } from "panelui-native";
import { EllipsisVertical } from "lucide-react-native";
import { useState } from "react";
import EditMyPlaylistDialog from "./EditMyPlaylistDialog";
import DeleteMyPlaylistDialog from "./DeleteMyPlaylistDialog";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Props = {
  onPress: (prev: any) => void;
  data: any;
};

const PlaylistItem = ({ onPress, data }: Props) => {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const options: any[] = [
    {
      icon: "playlist-edit",
      label: "Edit",

      onPress: () => {
        setOpen(false);
        setEditOpen(true);
      },
    },
    {
      icon: "delete",
      label: "Delete",
      onPress: () => {
        setOpen(false);
        setDeleteOpen(true);
      },
    },
  ];

  return (
    <>
      <Item className="px-0 py-2" onPress={onPress}>
        <Item.Media variant="image" className="rounded-sm border size-14">
          <Image
            source={{ uri: data?.coverImage }}
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#27272a",
            }}
          />
        </Item.Media>
        <Item.Content>
          <Item.Title numberOfLines={1} className="text-white font-normal">
            {data?.name || "Unknown Artist"}
          </Item.Title>

          <Item.Description className="text-sm font-normal">
            Playlist &bull; {data?.songs.length}{" "}
            {data?.songs.length > 1 ? "songs" : "song"}
          </Item.Description>
        </Item.Content>

        <Item.Actions>
          <BottomSheet open={open} onOpenChange={setOpen}>
            <BottomSheet.Trigger>
              <Button size="sm" variant="ghost">
                <EllipsisVertical size={20} color="gray" />
              </Button>
            </BottomSheet.Trigger>

            <BottomSheet.Content showClose={false}>
              <Item className="p-0 pb-3" onPress={onPress}>
                <Item.Media
                  variant="image"
                  className="rounded-sm border size-14"
                >
                  <Image
                    source={{ uri: data?.coverImage }}
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#27272a",
                    }}
                  />
                </Item.Media>
                <Item.Content>
                  <Item.Title
                    numberOfLines={1}
                    className="text-white font-normal"
                  >
                    {data?.name || "Unknown Artist"}
                  </Item.Title>

                  <Item.Description className="text-sm font-normal">
                    Playlist &bull; {data?.songs.length}{" "}
                    {data?.songs.length > 1 ? "songs" : "song"}
                  </Item.Description>
                </Item.Content>
              </Item>

              <View className="h-px bg-border mb-1" />
              {options.map((option) => (
                <View key={option.label}>
                  <Item
                    variant="default"
                    className="px-0 py-3 border-0 bg-transparent"
                    onPress={option.onPress}
                  >
                    <Item.Media>
                      <MaterialCommunityIcons
                        name={option.icon as any}
                        size={23}
                        color={option.color ?? "white"}
                      />
                    </Item.Media>
                    <Item.Content>
                      <Item.Title className="font-normal">
                        {option.label}
                      </Item.Title>
                    </Item.Content>
                  </Item>
                </View>
              ))}
            </BottomSheet.Content>
          </BottomSheet>
        </Item.Actions>
      </Item>

      <EditMyPlaylistDialog
        playlist={data}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <DeleteMyPlaylistDialog
        playlist={data}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  );
};

export default PlaylistItem;
