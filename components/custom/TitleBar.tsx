import { useState } from "react";
import { Image, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Check, ChevronLeft, Download, LogOut } from "lucide-react-native";
import {
  Avatar,
  Button,
  Drawer,
  Item,
  Panelside,
  Separator,
  Text,
} from "panelui-native";

import { useLibrary } from "@/src/hooks/useLibrary";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import useUser from "@/src/hooks/useUser";
import { AudioQuality, useAudioQuality } from "@/src/store/useAudioQuality";

import EditProfileDialog from "./EditProfileDialog";
import ExpandableSearch from "./ExpandableSearch";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import CreateMyPlaylistDialog from "./CreateMyPlaylistDialog";
import LogoutDialog from "./LogoutDialog";
import { useDownloadQuality } from "@/src/hooks/useDownloadQuality";
import UserPanel from "./ProfilePanel";
import ProfilePanel from "./ProfilePanel";

type Tab = "Home" | "Search" | "Library" | "Playlist";

type TitleBarProps = {
  showBackButton?: boolean;
  tabLabel?: string;
  tab?: Tab;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
};

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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

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

const TitleBar = ({
  showBackButton = false,
  tabLabel,
  tab,
  showSearch = false,
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: TitleBarProps) => {
  const { user } = useUser();
  const router = useRouter();
  const { isOffline } = useNetworkStatus();

  const [searchOpen, setSearchOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");

  const currentSearchValue = searchValue ?? internalSearch;

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearch(value);
    }
  };

  return (
    <View className="flex-row w-full items-center gap-3">
      {showBackButton && (
        <Button
          className="rounded-full size-5"
          variant="secondary"
          onPress={() => router.back()}
        >
          <ChevronLeft color="white" />
        </Button>
      )}

      {/* Title */}
      <View
        className="flex-1 min-w-0 justify-center"
        style={{ display: searchOpen ? "none" : "flex" }}
      >
        {tab === "Home" ? (
          <View>
            <Text size="sm" className="text-white/70 font-normal">
              {getGreeting()} 👋
            </Text>
            <Text className="text-2xl font-extrabold" numberOfLines={1}>
              {user?.username}
            </Text>
          </View>
        ) : (
          <Text size="3xl" weight="bold" numberOfLines={1}>
            {tabLabel}
          </Text>
        )}
      </View>

      {tab === "Playlist" && !isOffline && <CreateMyPlaylistDialog />}

      {/* Search */}
      {showSearch && !isOffline && (
        <View
          style={{
            flex: searchOpen ? 1 : 0,
            width: searchOpen ? undefined : 40,
          }}
        >
          <ExpandableSearch
            value={currentSearchValue}
            onChange={handleSearchChange}
            onSubmit={onSearchSubmit}
            onExpandChange={setSearchOpen}
          />
        </View>
      )}

      {!isOffline && (
        <Panelside.Trigger>
          <Button variant="ghost" className="p-0 m-0 rounded-full" size="xs">
            <Avatar
              size={tab === "Home" ? "md" : "sm"}
              source={{ uri: user?.profilePic }}
              fallback={user?.username?.[0]}
            />
          </Button>
        </Panelside.Trigger>
      )}
    </View>
  );
};

export default TitleBar;
