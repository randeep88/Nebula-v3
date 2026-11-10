import { Tabs } from "expo-router";
import { Image, Pressable, View } from "react-native";
import {
  House,
  Search,
  Library,
  Music,
} from "lucide-react-native";
import Svg, { Circle, Path, Polyline, Rect } from "react-native-svg";

type IconProps = { color: string; size?: number };

const svgProps = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

// const HomeIcon = ({ color, size = 24 }: IconProps) => (
//   <Svg width={size} height={size} viewBox="0 0 24 24">
//     <Path
//       d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
//       {...svgProps(color)}
//     />
//     <Polyline points="9 22 9 12 15 12 15 22" {...svgProps(color)} />
//   </Svg>
// );

// const SearchIcon = ({ color, size = 24 }: IconProps) => (
//   <Svg width={size} height={size} viewBox="0 0 24 24">
//     <Circle cx="11" cy="11" r="7" {...svgProps(color)} />
//     <Path d="m20 20-4-4" {...svgProps(color)} />
//   </Svg>
// );

// const LibraryIcon = ({ color, size = 24 }: IconProps) => (
//   <Svg width={size} height={size} viewBox="0 0 24 24">
//     <Path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19" {...svgProps(color)} />
//     <Path
//       d="M4 8.5A2.5 2.5 0 0 1 6.5 6H20v14H6.5A2.5 2.5 0 0 1 4 17.5z"
//       {...svgProps(color)}
//     />
//     <Path
//       d="M13 10v5.5a1.5 1.5 0 1 1-1.5-1.5c.6 0 1.1.2 1.5.5V10l4-1v5"
//       {...svgProps(color)}
//     />
//   </Svg>
// );

const Pill = ({
  focused,
  children,
}: {
  focused: boolean;
  children: React.ReactNode;
}) => (
  <View
    style={{
      width: 64,
      height: 38,
      borderRadius: 19,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: focused ? "#333" : "transparent",
    }}
  >
    {children}
  </View>
);

const TabButton = (props: any) => (
  <Pressable
    {...props}
    android_ripple={null}
    onPressIn={props.onPress}
    onPress={undefined}
    style={[
      props.style,
      {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      },
    ]}
  />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#9CA3AF",
        tabBarInactiveTintColor: "#9CA3AF",
        headerShown: false,
        tabBarButton: TabButton,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignItems: "center",
          justifyContent: "center",
        },
        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          height: 50,
          borderRadius: 30,
          backgroundColor: "#222",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: 0,
          paddingTop: 0,
          overflow: "hidden",
          marginHorizontal: 30,
        },
        // tabBarBackground: () => (
        //   <View
        //     style={{
        //       position: "absolute",
        //       top: 0,
        //       left: 0,
        //       right: 0,
        //       bottom: 0,
        //       backgroundColor: "rgba(35, 35, 35, 0.90)",
        //       borderRadius: 30,
        //       overflow: "hidden",
        //     }}
        //   />
        // ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          //@ts-ignore
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <Pill focused={focused}>
               <House color={color} size={22} />
            </Pill>
          ),
        }}
      />

      <Tabs.Screen
        name="components"
        options={{
          title: "Components",
          //@ts-ignore
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <Pill focused={focused}>
              <Search color={color} size={22} />
            </Pill>
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          //@ts-ignore
          tabBarIcon: ({
            color,
            focused,
          }: {
            color: string;
            focused: boolean;
          }) => (
            <Pill focused={focused}>
              <Music color={color} size={22} />
            </Pill>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <Pill focused={focused}>
              <Image
                source={require("../../../assets/images/dummy.jpg")}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  borderColor: "black",
                }}
              />
            </Pill>
          ),
        }}
      />
    </Tabs>
  );
}
