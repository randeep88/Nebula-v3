import { View, Text, Image } from "react-native";
import { GlobeOff } from "lucide-react-native";
import { ChevronRightIcon, Item } from "panelui-native";
import { useRouter } from "expo-router";

type OfflineStateProps = {
  title?: string;
  message?: string;
  showDownloads?: boolean;
};

const OfflineState = ({
  title = "No internet connection",
  message = "Connect to the internet and try again.",
  showDownloads,
}: OfflineStateProps) => {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-2">
      <View className="mb-2">
        <GlobeOff size={60} strokeWidth={1.3} color="white" />
      </View>

      <Text className="text-lg font-medium text-white">{title}</Text>
      <Text className="text-muted-foreground font-normal">{message}</Text>

      {showDownloads && (
        <View>
          <Item
            size="xs"
            variant="muted"
            className="mt-5"
            onPress={() => router.push("/(tabs)/(library)/downloads")}
          >
            <Item.Media variant="image" className="rounded-sm">
              <Image
                source={require("../../assets/images/downloaded.jpg")}
                style={{
                  width: "100%",
                  height: "100%",
                }}
              />
            </Item.Media>
            <Item.Content>
              <Item.Title
                numberOfLines={1}
                className="text-white font-medium text-base"
              >
                Downloads
              </Item.Title>
            </Item.Content>
            <Item.Actions>
              <ChevronRightIcon color="white" />
            </Item.Actions>
          </Item>
        </View>
      )}
    </View>
  );
};

export default OfflineState;
