import { useAudioQuality } from "@/src/store/useAudioQuality";
import { useDownloadStore } from "@/src/store/useDownloadStore";
import { File } from "expo-file-system";
import { useDownloadQuality } from "../hooks/useDownloadQuality";

export const getArtistName = (song: any) => {
  const artists = song?.artists?.primary;
  if (Array.isArray(artists) && artists.length > 0) {
    return artists.map((a: any) => a?.name).join(", ");
  }
  return song?.primaryArtists ?? "Unknown artist";
};

export const getRemoteUrl = (song: any): string | undefined => {
  const quality = useAudioQuality.getState().quality;
  const urls = song?.downloadUrl ?? [];
  return (urls.find((d: any) => d.quality === quality) ?? urls[urls.length - 1])
    ?.url;
};

export const getDownloadUrl = (song: any): string | undefined => {
  const quality = useDownloadQuality.getState().quality;
  const urls = song?.downloadUrl ?? [];

  return (
    urls.find((d: any) => d.quality === quality)?.url ??
    urls[urls.length - 1]?.url
  );
};

export const songToTrack = (song: any) => {
  const localUri = useDownloadStore.getState().downloads[song?.id]?.uri;

  const localFile = localUri ? new File(localUri) : null;

  const url = localFile?.exists ? localUri : getRemoteUrl(song);

  if (!url) return null;

  return {
    mediaId: String(song.id),
    url,
    title: song.name,
    artist: getArtistName(song),
    artworkUrl: song?.image?.[2]?.url,
  };
};
