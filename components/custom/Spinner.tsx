import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Loader } from "lucide-react-native";

const AnimatedLoader = Animated.createAnimatedComponent(Loader);

const Spinner = ({ size = 22 }: { size?: number }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return <AnimatedLoader size={size} color="white" style={animatedStyle} />;
};

export default Spinner;
