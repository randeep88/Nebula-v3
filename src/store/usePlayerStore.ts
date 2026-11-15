import { RepeatMode } from "@rntp/player";
import { create } from "zustand";

type PlayerState = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  repeat: RepeatMode;
  shuffle: boolean;
  queueVersion: number;
  queueSongs: any[];
  dominantColor: string;
  currentSong: any | null;
  setCurrentSong: (song: any | null) => void;
  setRepeat: (repeat: RepeatMode) => void;
  setShuffle: (shuffle: boolean) => void;
  touchQueue: () => void;
  updateQueueSongs: (fn: (songs: any[]) => any[]) => void;
  setDominantColor: (color: string) => void;
  songsById: Record<string, any>;
  registerSongs: (songs: any[]) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  searchQuery: "",
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  repeat: RepeatMode.Off,
  shuffle: false,
  queueVersion: 0,
  queueSongs: [],
  dominantColor: "#000000",
  currentSong: null,
  setCurrentSong: (song) => set({ currentSong: song }),
  setRepeat: (repeat) => set({ repeat }),
  setShuffle: (shuffle) => set({ shuffle }),
  touchQueue: () => set((s) => ({ queueVersion: s.queueVersion + 1 })),
  updateQueueSongs: (fn) => set((s) => ({ queueSongs: fn(s.queueSongs) })),
  setDominantColor: (dominantColor) => set({ dominantColor }),
  songsById: {},
  registerSongs: (songs) =>
    set((s) => {
      const next = { ...s.songsById };
      songs.forEach((song) => {
        if (song?.id) next[String(song.id)] = song;
      });
      return { songsById: next };
    }),
}));
