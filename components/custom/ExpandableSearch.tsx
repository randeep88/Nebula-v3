import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, TextInput, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Search, X } from "lucide-react-native";
import { useCSSVariable } from "uniwind";
import type { TextInputInstance } from "react-native";

const SIZE = 40;
const DURATION = 260;

type ExpandableSearchProps = {
  value: string;
  onChange: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  onExpandChange?: (open: boolean) => void;
};

const ExpandableSearch = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search songs, artists, albums...",
  onExpandChange,
}: ExpandableSearchProps) => {
  const inputRef = useRef<TextInputInstance>(null);
  const [open, setOpen] = useState(!!value);
  const [maxWidth, setMaxWidth] = useState(0);
  const progress = useSharedValue(value ? 1 : 0);

  const [foreground, mutedForeground] = useCSSVariable([
    "--color-foreground",
    "--color-muted-foreground",
  ]) as (string | undefined)[];

  const iconColor = foreground ?? "#ffffff";
  const hintColor = mutedForeground ?? "#9ca3af";

  const animate = (to: number) => {
    progress.value = withTiming(to, {
      duration: DURATION,
      easing: Easing.out(Easing.cubic),
    });
  };

  const containerStyle = useAnimatedStyle(() => ({
    width: SIZE + (Math.max(maxWidth, SIZE) - SIZE) * progress.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const expand = () => {
    setOpen(true);
    onExpandChange?.(true);
    animate(1);
    inputRef.current?.focus();
  };

  const collapse = () => {
    setOpen(false);
    onExpandChange?.(false);
    animate(0);
    inputRef.current?.blur();
    Keyboard.dismiss();
  };

  useEffect(() => {
    if (value && !open) {
      setOpen(true);
      onExpandChange?.(true);
      animate(1);
    }
  }, [value]);

  const handleIconPress = () => {
    if (open) onSubmit?.();
    else expand();
  };

  const handleClose = () => {
    if (value) {
      onChange("");
      inputRef.current?.focus();
    } else {
      collapse();
    }
  };

  return (
    <View
      pointerEvents="box-none"
      onLayout={(e) => setMaxWidth(e.nativeEvent.layout.width)}
      style={{ width: "100%", height: SIZE, alignItems: "flex-end" }}
    >
      <Animated.View
        style={[
          { height: SIZE, borderRadius: SIZE / 2, overflow: "hidden" },
          containerStyle,
        ]}
      >
        <View className="flex-1 flex-row items-center bg-muted">
          <Pressable
            onPress={handleIconPress}
            hitSlop={6}
            style={{
              width: SIZE,
              height: SIZE,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Search size={20} color={iconColor} />
          </Pressable>

          <Animated.View
            pointerEvents={open ? "auto" : "none"}
            style={[
              { flex: 1, flexDirection: "row", alignItems: "center" },
              contentStyle,
            ]}
          >
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChange}
              onSubmitEditing={onSubmit}
              onBlur={() => {
                if (!value) collapse();
              }}
              placeholder={placeholder}
              placeholderTextColor={hintColor}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              className="flex-1 text-foreground p-0"
              style={{ height: SIZE }}
            />

            <Pressable
              onPress={handleClose}
              hitSlop={6}
              style={{
                width: SIZE,
                height: SIZE,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={18} color={hintColor} />
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

export default ExpandableSearch;
