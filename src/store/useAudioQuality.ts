import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type AudioQuality = "48kbps" | "96kbps" | "160kbps" | "320kbps";

type AudioQualityState = {
  quality: AudioQuality;
  setQuality: (quality: AudioQuality) => void;
};

export const useAudioQuality = create<AudioQualityState>()(
  persist(
    (set) => ({
      quality: "320kbps",
      setQuality: (quality) => set({ quality }),
    }),
    {
      name: "audio-quality",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);