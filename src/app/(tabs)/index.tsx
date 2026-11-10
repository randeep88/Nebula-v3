import { useLibrary } from "@/src/hooks/useLibrary";
import useMyPlaylist from "@/src/hooks/useMyPlaylist";
import useUser from "@/src/hooks/useUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const LAST_SONG_KEY = "lastPlayedSongData";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
};

const seededRandom = (seed: number) => {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const getDailySeed = () => {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
};

const dailyShuffle = (list: any[]) => {
  const arr = [...list];
  const random = seededRandom(getDailySeed());
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const Home = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();

  const { libraryItems } = useLibrary();
  const { myPlaylists } = useMyPlaylist();
  const [savedSong, setSavedSong] = useState<any>(null);

  useEffect(() => {
    const loadSaved = async () => {
      try {
        const raw = await AsyncStorage.getItem(LAST_SONG_KEY);
        if (raw) setSavedSong(JSON.parse(raw));
      } catch (err) {
        console.log("Load last song failed:", err);
      }
    };
    loadSaved();
  }, []);

  const recent = [
    {
      name: "Liked Songs",
      image: require("../../../assets/images/lb.png"),
      // onpress: () => router.push("/(tabs)/(home)/LikedSongs"),
    },
    {
      name: "Your Playlists",
      image: require("../../../assets/images/pb.png"),
      onpress: () => router.push("/(tabs)/profile"),
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 40,
        paddingHorizontal: 16,
        gap: 28,
      }}
    ></ScrollView>
  );
};

export default Home;
