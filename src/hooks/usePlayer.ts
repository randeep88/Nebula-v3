import { useMemo } from "react";
import TrackPlayer, {
  RepeatMode,
  useActiveMediaItem,
  useIsPlaying,
} from "@rntp/player";
import { usePlayerStore } from "@/src/store/usePlayerStore";
import { songToTrack } from "@/src/utils/songToTrack";

const toEntries = (songs: any[]) =>
  songs.flatMap((song) => {
    const track = songToTrack(song);
    return track ? [{ id: String(song.id), song, track }] : [];
  });

export const usePlayer = () => {
  const activeItem = useActiveMediaItem();
  const playing = useIsPlaying();
  const repeat = usePlayerStore((s) => s.repeat);
  const shuffle = usePlayerStore((s) => s.shuffle);
  const queueVersion = usePlayerStore((s) => s.queueVersion);
  const songsById = usePlayerStore((s) => s.songsById);
  const setRepeat = usePlayerStore((s) => s.setRepeat);
  const setShuffle = usePlayerStore((s) => s.setShuffle);
  const touchQueue = usePlayerStore((s) => s.touchQueue);
  const registerSongs = usePlayerStore((s) => s.registerSongs);

  const queue = useMemo(
    () => TrackPlayer.getQueue(),
    [queueVersion, activeItem],
  );

  const activeIndex = useMemo(
    () => TrackPlayer.getActiveMediaItemIndex() ?? -1,
    [queueVersion, activeItem],
  );

  const mediaId = activeItem?.mediaId ? String(activeItem.mediaId) : undefined;
  const currentSong = mediaId ? (songsById[mediaId] ?? null) : null;

  const isActive = (song: any) =>
    !!activeItem && !!song?.id && mediaId === String(song.id);

  const isSongPlaying = (song: any) => isActive(song) && playing;

  const startQueue = async (songs: any[], startSong: any) => {
    const entries = toEntries(songs);
    const index = entries.findIndex((e) => e.id === String(startSong.id));
    if (index === -1) return;

    registerSongs(entries.map((e) => e.song));
    await TrackPlayer.setMediaItems(
      entries.map((e) => e.track),
      index,
    );
    TrackPlayer.play();
    touchQueue();
  };

  const togglePlayPause = () => {
    if (playing) TrackPlayer.pause();
    else TrackPlayer.play();
  };

  const playSong = async (song: any, songs: any[] = [song]) => {
    if (isActive(song)) {
      togglePlayPause();
      return;
    }
    await startQueue(songs, song);
  };

  const playShuffled = async (songs: any[]) => {
    if (songs.length === 0) return;
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    await startQueue(shuffled, shuffled[0]);
  };

  const addToQueue = (song: any) => {
    const track = songToTrack(song);
    if (!track) return false;
    registerSongs([song]);
    TrackPlayer.addMediaItem(track);
    touchQueue();
    return true;
  };

  const playNext = (song: any) => {
    const track = songToTrack(song);
    if (!track) return false;
    registerSongs([song]);
    const index = (TrackPlayer.getActiveMediaItemIndex() ?? -1) + 1;
    TrackPlayer.insertMediaItem(index, track);
    touchQueue();
    return true;
  };

  const removeFromQueue = (index: number) => {
    TrackPlayer.removeMediaItem(index);
    touchQueue();
  };

  const moveInQueue = (fromIndex: number, toIndex: number) => {
    const total = TrackPlayer.getQueue().length;
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= total ||
      toIndex >= total
    ) {
      return;
    }
    TrackPlayer.moveMediaItem(fromIndex, toIndex);
    touchQueue();
  };

  const clearUpcoming = () => {
    const from = (TrackPlayer.getActiveMediaItemIndex() ?? -1) + 1;
    const total = TrackPlayer.getQueue().length;
    if (from < total) TrackPlayer.removeMediaItems(from, total);
    touchQueue();
  };

  const clearQueue = () => {
    TrackPlayer.clear();
    touchQueue();
  };

  const skipToIndex = (index: number) => {
    TrackPlayer.skipToIndex(index);
    TrackPlayer.play();
  };

  const next = () => TrackPlayer.skipToNext();
  const previous = () => TrackPlayer.skipToPrevious();
  const seekTo = (seconds: number) => TrackPlayer.seekTo(seconds);

  const toggleShuffle = () => {
    const value = !shuffle;
    TrackPlayer.setShuffleEnabled(value);
    setShuffle(value);
  };

  const cycleRepeat = () => {
    const nextMode =
      repeat === RepeatMode.Off
        ? RepeatMode.All
        : repeat === RepeatMode.All
          ? RepeatMode.One
          : RepeatMode.Off;
    TrackPlayer.setRepeatMode(nextMode);
    setRepeat(nextMode);
  };

  return {
    activeItem,
    currentSong,
    activeIndex,
    playing,
    queue,
    shuffle,
    repeat,
    isSongPlaying,
    playSong,
    playShuffled,
    togglePlayPause,
    addToQueue,
    playNext,
    removeFromQueue,
    moveInQueue,
    clearUpcoming,
    clearQueue,
    skipToIndex,
    next,
    previous,
    seekTo,
    toggleShuffle,
    cycleRepeat,
  };
};
