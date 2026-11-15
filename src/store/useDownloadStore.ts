
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
} from "zustand/middleware";

type DownloadEntry = {
  uri: string;
  song: any;
};

type DownloadState = {
  downloads: Record<string, DownloadEntry>;
  downloading: Record<string, boolean>;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  addDownload: (id: string, entry: DownloadEntry) => void;
  removeDownload: (id: string) => void;
  setDownloading: (id: string, value: boolean) => void;
};

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set) => ({
      downloads: {},
      downloading: {},
      hasHydrated: false,

      setHasHydrated: (value) =>
        set({ hasHydrated: value }),

      addDownload: (id, entry) =>
        set((state) => ({
          downloads: {
            ...state.downloads,
            [id]: entry,
          },
          downloading: {
            ...state.downloading,
            [id]: false,
          },
        })),

      removeDownload: (id) =>
        set((state) => {
          const downloads = { ...state.downloads };
          const downloading = { ...state.downloading };

          delete downloads[id];
          delete downloading[id];

          return { downloads, downloading };
        }),

      setDownloading: (id, value) =>
        set((state) => {
          const downloading = { ...state.downloading };

          if (value) {
            downloading[id] = true;
          } else {
            delete downloading[id];
          }

          return { downloading };
        }),
    }),
    {
      name: "downloads",
      storage: createJSONStorage(() => AsyncStorage),

      partialize: (state) => ({
        downloads: state.downloads,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
