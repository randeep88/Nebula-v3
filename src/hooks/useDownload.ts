import { Directory, File, Paths } from "expo-file-system";
import { useDownloadStore } from "@/src/store/useDownloadStore";
import { getDownloadUrl } from "@/src/utils/songToTrack";
import { useEffect } from "react";
import AppToast from "@/components/custom/Toast";
import { useAudioQuality } from "../store/useAudioQuality";

export const useDownload = () => {
  const { showToast } = AppToast();
  const hasHydrated = useDownloadStore((s) => s.hasHydrated);
  const downloads = useDownloadStore((s) => s.downloads);
  const downloading = useDownloadStore((s) => s.downloading);
  const addDownload = useDownloadStore((s) => s.addDownload);
  const removeEntry = useDownloadStore((s) => s.removeDownload);
  const setDownloading = useDownloadStore((s) => s.setDownloading);

  const isDownloaded = (songId?: string) => !!songId && !!downloads[songId];
  const isDownloading = (songId?: string) => !!songId && !!downloading[songId];

  const getDownloadedQuality = (songId?: string): string | undefined =>
  songId ? downloads[songId]?.song?.downloadedQuality : undefined;

  const downloadSong = async (song: any) => {
    if (!song?.id || isDownloaded(song.id) || isDownloading(song.id)) return;

    const url = getDownloadUrl(song);
    if (!url) {
      showToast({
        message: "No download link found",
        variant: "warning",
      });
      return;
    }

    setDownloading(song.id, true);
    try {
      const dir = new Directory(Paths.document, "downloads");
      if (!dir.exists) dir.create();

      const target = new File(dir, `${song.id}.m4a`);
      if (target.exists) target.delete();

      const file = await File.downloadFileAsync(url, target);
      addDownload(song.id, {
        uri: file.uri,
        song: {
          ...song,
          downloadedQuality: useAudioQuality.getState().quality,
        },
      });
      showToast({
        message: `${song.name} downloaded`,
        variant: "success",
      });
    } catch (err: any) {
      console.log("Download failed:", err?.message);
      showToast({
        message: "Download failed",
        variant: "destructive",
      });
    } finally {
      setDownloading(song.id, false);
    }
  };

  useEffect(() => {
    if (!hasHydrated) return;

    Object.entries(downloads).forEach(([id, entry]) => {
      const file = new File(entry.uri);

      if (!file.exists) {
        removeEntry(id);
      }
    });
  }, [hasHydrated]);

  const removeDownload = (songId: string) => {
    const entry = downloads[songId];
    if (!entry) return;
    try {
      const file = new File(entry.uri);
      if (file.exists) file.delete();
    } catch (err) {
      console.log("Delete file failed:", err);
    }
    removeEntry(songId);
    showToast({
      message: "Download removed",
      variant: "success",
    });
  };

  const downloadedSongs = Object.values(downloads).map((d) => d.song);

  return {
  downloadSong,
  removeDownload,
  isDownloaded,
  isDownloading,
  getDownloadedQuality,
  downloadedSongs,
};
};
