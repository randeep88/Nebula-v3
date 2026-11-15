import { memo, useCallback, useMemo, useRef } from "react";
import { Image, useWindowDimensions, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { BroomSparkles, GripVertical, X } from "lucide-react-native";

import { BottomSheet, Button, Item, Text, Tooltip } from "panelui-native";

import ReorderableList, {
  ReorderableListReorderEvent,
  useReorderableDrag,
} from "react-native-reorderable-list";

import { usePlayer } from "@/src/hooks/usePlayer";

type QueueEntry = {
  key: string;
  item: any;
};

type QueueRowProps = {
  item: any;
  index: number;
  playing: boolean;
  onPlay: (index: number) => void;
  onRemove: (index: number) => void;
};

const QueueRow = memo(
  ({ item, index, playing, onPlay, onRemove }: QueueRowProps) => {
    const drag = useReorderableDrag();

    return (
      <Item className="py-2 px-0" onPress={() => onPlay(index)}>
        <Item.Media variant="image" className="size-12 rounded-sm">
          <Image
            source={{ uri: item?.artworkUrl }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="cover"
          />
        </Item.Media>

        <Item.Content>
          <View className="flex-row items-center gap-2">
            {playing && (
              <Image
                source={require("@/assets/images/gif1.gif")}
                style={{ width: 16, height: 16 }}
                resizeMode="contain"
              />
            )}

            <Item.Title
              className={`flex-1 font-normal ${playing ? "text-primary" : ""}`}
              numberOfLines={1}
            >
              {item?.title}
            </Item.Title>
          </View>

          <Item.Description numberOfLines={1}>{item?.artist}</Item.Description>
        </Item.Content>

        <Item.Actions className="gap-0">
          <Button
            size="icon"
            variant="ghost"
            onLongPress={drag}
            delayLongPress={150}
          >
            <GripVertical size={20} color="gray" />
          </Button>

          <Button size="icon" variant="ghost" onPress={() => onRemove(index)}>
            <X size={18} color="gray" />
          </Button>
        </Item.Actions>
      </Item>
    );
  },
);

QueueRow.displayName = "QueueRow";

const QueueSheet = () => {
  const { height } = useWindowDimensions();

  const player = usePlayer();
  const playerRef = useRef(player);
  playerRef.current = player;

  const { queue, activeIndex, playing, clearUpcoming } = player;

  const rows = useMemo<QueueEntry[]>(() => {
    const seen: Record<string, number> = {};

    return queue.map((item: any) => {
      const id = item.url || item.id;
      const count = (seen[id] ?? 0) + 1;

      seen[id] = count;

      return {
        key: `${id}#${count}`,
        item,
      };
    });
  }, [queue]);

  const onPlay = useCallback((index: number) => {
    playerRef.current.skipToIndex(index);
  }, []);

  const onRemove = useCallback((index: number) => {
    playerRef.current.removeFromQueue(index);
  }, []);

  const onReorder = useCallback(({ from, to }: ReorderableListReorderEvent) => {
    playerRef.current.moveInQueue(from, to);
  }, []);

  const keyExtractor = useCallback((row: QueueEntry) => row.key, []);

  const renderItem = useCallback(
    ({ item: row, index }: { item: QueueEntry; index: number }) => (
      <QueueRow
        item={row.item}
        index={index}
        playing={index === activeIndex && playing}
        onPlay={onPlay}
        onRemove={onRemove}
      />
    ),
    [activeIndex, playing, onPlay, onRemove],
  );

  return (
    <BottomSheet>
      <BottomSheet.Trigger>
        <Button size="sm" variant="ghost" className="rounded-full">
          <MaterialCommunityIcons
            name="playlist-music-outline"
            size={25}
            color="white"
          />
        </Button>
      </BottomSheet.Trigger>

      <BottomSheet.Content showClose={false}>
        <View className="flex-row items-center justify-between pb-2">
          <View>
            <Text className="font-bold text-xl text-white">Queue</Text>

            <Text className="text-muted-foreground text-xs">
              {queue.length} {queue.length === 1 ? "song" : "songs"}
            </Text>
          </View>

          {activeIndex + 1 < queue.length && (
            <Button
              size="xs"
              variant="secondary"
              className="rounded-full"
              onPress={clearUpcoming}
            >
              <BroomSparkles size={14} color="white" />
              Clear Upcoming
            </Button>
          )}
        </View>

        <View style={{ height: height * 0.55 }}>
          <ReorderableList
            data={rows}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onReorder={onReorder}
            animationDuration={0}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </BottomSheet.Content>
    </BottomSheet>
  );
};

export default memo(QueueSheet);
