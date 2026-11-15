import { View, Image } from "react-native";
import React, { useState } from "react";
import {
  Button,
  Item,
  Panelside,
  Separator,
  Text,
  usePanelside,
} from "panelui-native";
import useUser from "@/src/hooks/useUser";
import { useRouter } from "expo-router";
import { useLibrary } from "@/src/hooks/useLibrary";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import { AudioQuality, useAudioQuality } from "@/src/store/useAudioQuality";
import { useDownloadQuality } from "@/src/hooks/useDownloadQuality";
import { Check, Download, LogOut, X } from "lucide-react-native";
import EditProfileDialog from "./EditProfileDialog";
import LogoutDialog from "./LogoutDialog";

const MenuRow = ({
  icon,
  label,
  onPress,
  danger = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <Item variant="default" size="sm" onPress={onPress}>
    <Item.Media>{icon}</Item.Media>
    <Item.Content>
      <Item.Title
        className={`text-sm font-medium ${danger ? "text-red-500" : ""}`}
      >
        {label}
      </Item.Title>
    </Item.Content>
  </Item>
);

const Stat = ({ value, label }: { value: number; label: string }) => (
  <View className="flex-1 items-center py-3">
    <Text size="xl" weight="bold">
      {value}
    </Text>
    <Text size="xs" className="text-muted-foreground">
      {label}
    </Text>
  </View>
);

const qualities: {
  label: string;
  value: AudioQuality;
  description: string;
}[] = [
  { label: "Low", value: "48kbps", description: "Data saver" },
  { label: "Medium", value: "96kbps", description: "Balanced" },
  {
    label: "High",
    value: "160kbps",
    description: "Great for everyday listening",
  },
  {
    label: "Ultra",
    value: "320kbps",
    description: "Best sound, uses more data",
  },
];

const ProfilePanel = () => {
  const { user, logout } = useUser();
  const { setOpen } = usePanelside();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const router = useRouter();
  const { libraryItems } = useLibrary();
  const { myPlaylists } = useMyPlaylist();
  const { quality, setQuality } = useAudioQuality();
  const { quality: downloadQuality, setQuality: setDownloadQuality } =
    useDownloadQuality();

  const likedCount = (libraryItems || []).filter(
    (entry: any) => entry.type === "song" && entry.success,
  ).length;

  const playlistCount = (myPlaylists || []).length;
  return (
    <>
      <Panelside.Header title="Profile & Settings" />
      <Panelside.Content>
        <View className="w-full rounded-xl overflow-hidden bg-muted">
          <View className="h-28 w-full overflow-hidden bg-primary/30">
            {user?.profilePic ? (
              <Image
                source={{ uri: user.profilePic }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
                blurRadius={25}
              />
            ) : null}
          </View>

          <View className="items-center -mt-14 pb-2">
            <View className="size-28 rounded-full border-4 border-background overflow-hidden bg-muted items-center justify-center">
              {user?.profilePic ? (
                <Image
                  source={{ uri: user.profilePic }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <Text size="3xl" weight="bold">
                  {user?.username?.[0]}
                </Text>
              )}
            </View>

            <Text size="xl" weight="bold" className="mt-3" numberOfLines={1}>
              {user?.username}
            </Text>

            {user?.email ? (
              <Text
                size="sm"
                className="text-muted-foreground"
                numberOfLines={1}
              >
                {user.email}
              </Text>
            ) : null}
          </View>

          <View className="p-1">
            <EditProfileDialog />
          </View>
        </View>

        <View className="flex-row mt-4 rounded-2xl bg-muted">
          <Stat value={likedCount} label="Liked songs" />
          <View className="w-px bg-border my-3" />
          <Stat value={playlistCount} label="Playlists" />
        </View>

        {/* Audio Quality */}
        <View className="mt-4 gap-4">
          <View>
            <Text weight="semibold">Audio quality</Text>
            <Text size="xs" className="text-muted-foreground">
              Higher quality uses more data
            </Text>
          </View>

          <View className="gap-2">
            {qualities.map((q) => {
              const selected = q.value === quality;

              return (
                <Button
                  size="xs"
                  key={q.value}
                  onPress={() => setQuality(q.value)}
                  variant="ghost"
                  className="rounded-full bg-transparent w-full items-center justify-between"
                >
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`size-5 rounded-full items-center justify-center ${
                        selected ? "bg-primary" : "border border-accent"
                      }`}
                    >
                      {selected ? <Check size={12} color="#101010" /> : null}
                    </View>
                    <Text size="sm" weight="normal" numberOfLines={1}>
                      {q.label}
                    </Text>
                  </View>

                  <Text
                    size="xs"
                    className={
                      selected ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    {q.value}
                  </Text>
                </Button>
              );
            })}
          </View>
        </View>

        <Separator className="my-4" />

        {/* Download Quality */}
        <View className="gap-4">
          <View>
            <Text weight="semibold">Download quality</Text>
            <Text size="xs" className="text-muted-foreground">
              Higher quality uses more data
            </Text>
          </View>

          <View className="gap-2">
            {qualities.map((q) => {
              const selected = q.value === downloadQuality;

              return (
                <Button
                  size="xs"
                  key={q.value}
                  onPress={() => setDownloadQuality(q.value)}
                  variant="ghost"
                  className="rounded-full w-full items-center justify-between bg-transparent"
                >
                  <View className="flex-row items-center gap-2">
                    <View
                      className={`size-5 rounded-full items-center justify-center ${
                        selected ? "bg-primary" : "border border-accent"
                      }`}
                    >
                      {selected ? <Check size={12} color="#101010" /> : null}
                    </View>
                    <Text size="sm" weight="normal" numberOfLines={1}>
                      {q.label}
                    </Text>
                  </View>

                  <Text
                    size="xs"
                    className={
                      selected ? "text-primary" : "text-muted-foreground"
                    }
                  >
                    {q.value}
                  </Text>
                </Button>
              );
            })}
          </View>
        </View>

        <Separator className="my-4" />

        <View>
          <MenuRow
            icon={<Download size={20} color="white" />}
            label="Downloads"
            onPress={() => {
              setOpen(false);
              router.push("/(tabs)/(home)/downloads");
            }}
          />
          <MenuRow
            icon={<LogOut size={20} color="red" />}
            label="Log out"
            danger
            onPress={() => {
              setOpen(false);
              setLogoutOpen(true);
            }}
          />
        </View>

        <Text className="text-gray-400 text-xs my-3 text-center">
          Made with ❤️ by Randeep Singh
        </Text>
      </Panelside.Content>

      <LogoutDialog
        onLogout={() => logout()}
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
      />
    </>
  );
};

export default ProfilePanel;
