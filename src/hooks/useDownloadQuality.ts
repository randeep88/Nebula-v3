import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DownloadQuality =
  | "48kbps"
  | "96kbps"
  | "160kbps"
  | "320kbps";

type DownloadQualityState = {
  quality: DownloadQuality;
  setQuality: (quality: DownloadQuality) => void;
};

export const useDownloadQuality = create<DownloadQualityState>()(
  persist(
    (set) => ({
      quality: "320kbps",
      setQuality: (quality) => set({ quality }),
    }),
    {
      name: "download-quality",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);