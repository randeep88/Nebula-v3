import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../utils/api";
import { backendAPI } from "../utils/backendAPI";
import AppToast from "@/components/custom/Toast";

export type LibraryType = "song" | "artist" | "album" | "playlist";

export type LibraryInput =
  | string
  | number
  | { id: string | number; [key: string]: any };

const CONFIG = {
  song: {
    key: ["librarySongs"],
    path: "song",
    idField: "songId",
    label: "Song",
    detail: (id: string) => `/songs/${id}`,
  },
  artist: {
    key: ["libraryArtists"],
    path: "artist",
    idField: "artistId",
    label: "Artist",
    detail: (id: string) => `/artists/${id}`,
  },
  album: {
    key: ["libraryAlbums"],
    path: "album",
    idField: "albumId",
    label: "Album",
    detail: (id: string) => `/albums?id=${id}`,
  },
  playlist: {
    key: ["libraryPlaylists"],
    path: "playlist",
    idField: "playlistId",
    label: "Playlist",
    detail: (id: string) => `/playlists?id=${id}`,
  },
} as const;

const EMPTY: any[] = [];

const authHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return { Authorization: `Bearer ${token}` };
};

const idOf = (input: LibraryInput) =>
  typeof input === "object" && input !== null
    ? String(input.id)
    : String(input);

const fetchDetail = async (type: LibraryType, id: string) => {
  const res = await api.get(CONFIG[type].detail(id));
  return { type, success: true, id, ...res.data };
};

const buildEntry = (type: LibraryType, id: string, input: LibraryInput) => {
  const base = { type, success: true, id };
  if (typeof input === "object" && input !== null) {
    return { ...base, data: type === "song" ? [input] : input };
  }
  return base;
};

const useLibraryType = (type: LibraryType) => {
  const queryClient = useQueryClient();
  const { showToast } = AppToast();

  const { key, path, idField, label } = CONFIG[type];

  const query = useQuery<any[]>({
    queryKey: key,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    queryFn: async () => {
      const headers = await authHeaders();
      const res = await backendAPI.get(`/library/${path}`, { headers });

      const ids: string[] = (res.data || []).map((entry: any) =>
        String(entry[idField]),
      );

      const cached = new Map<string, any>(
        (queryClient.getQueryData<any[]>(key) ?? [])
          .filter((entry) => entry?.success && entry?.data)
          .map((entry) => [String(entry.id), entry]),
      );

      const results = await Promise.allSettled(
        ids.map((id) => cached.get(id) ?? fetchDetail(type, id)),
      );

      return results
        .filter(
          (r): r is PromiseFulfilledResult<any> => r.status === "fulfilled",
        )
        .map((r) => r.value);
    },
  });

  const add = useMutation({
    mutationFn: async (input: LibraryInput) => {
      const id = idOf(input);
      const headers = await authHeaders();
      await backendAPI.post(
        `/library/${path}/add`,
        { [idField]: id },
        { headers },
      );
      return id;
    },

    onMutate: async (input) => {
      const id = idOf(input);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<any[]>(key);

      queryClient.setQueryData<any[]>(key, (old = []) =>
        old.some((entry) => String(entry.id) === id)
          ? old
          : [...old, buildEntry(type, id, input)],
      );

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      } else {
        queryClient.invalidateQueries({ queryKey: key });
      }
      showToast({
        message: `Failed to add ${label.toLowerCase()} to library`,
        variant: "destructive",
      });
    },

    onSuccess: async (id) => {
      showToast({
        message: `${label} added to library`,
        variant: "success",
      });

      const current = queryClient.getQueryData<any[]>(key) ?? [];
      const entry = current.find((e) => String(e.id) === id);
      if (!entry || entry.data) return;

      try {
        const detail = await fetchDetail(type, id);
        queryClient.setQueryData<any[]>(key, (old = []) =>
          old.map((e) => (String(e.id) === id ? detail : e)),
        );
      } catch {}
    },
  });

  const remove = useMutation({
    mutationFn: async (input: LibraryInput) => {
      const id = idOf(input);
      const headers = await authHeaders();
      await backendAPI.delete(`/library/${path}/remove`, {
        data: { [idField]: id },
        headers,
      });
      return id;
    },

    onMutate: async (input) => {
      const id = idOf(input);
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<any[]>(key);

      queryClient.setQueryData<any[]>(key, (old = []) =>
        old.filter((entry) => String(entry.id) !== id),
      );

      return { previous };
    },

    onError: (_err, _input, context) => {
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      } else {
        queryClient.invalidateQueries({ queryKey: key });
      }

      showToast({
        message: `Failed to remove ${label.toLowerCase()} from library`,
        variant: "destructive",
      });
    },

    onSuccess: () => {
      showToast({
        message: `${label} removed from library`,
        variant: "success",
      });
    },
  });

  return { query, add, remove };
};

export const useLibrary = () => {
  const songs = useLibraryType("song");
  const artists = useLibraryType("artist");
  const albums = useLibraryType("album");
  const playlists = useLibraryType("playlist");

  const songItems = songs.query.data ?? EMPTY;
  const artistItems = artists.query.data ?? EMPTY;
  const albumItems = albums.query.data ?? EMPTY;
  const playlistItems = playlists.query.data ?? EMPTY;

  const libraryItems = useMemo(
    () => [...songItems, ...artistItems, ...albumItems, ...playlistItems],
    [songItems, artistItems, albumItems, playlistItems],
  );

  const idSets = useMemo(
    () => ({
      song: new Set(songItems.map((e) => String(e.id))),
      artist: new Set(artistItems.map((e) => String(e.id))),
      album: new Set(albumItems.map((e) => String(e.id))),
      playlist: new Set(playlistItems.map((e) => String(e.id))),
    }),
    [songItems, artistItems, albumItems, playlistItems],
  );

  const isInLibrary = useCallback(
    (type: LibraryType, id?: string | number | null) =>
      id !== undefined && id !== null && idSets[type].has(String(id)),
    [idSets],
  );

  const isLoading =
    songs.query.isPending ||
    artists.query.isPending ||
    albums.query.isPending ||
    playlists.query.isPending;

  const isError =
    songs.query.isError ||
    artists.query.isError ||
    albums.query.isError ||
    playlists.query.isError;

  const refetch = async () => {
    await Promise.all([
      songs.query.refetch(),
      artists.query.refetch(),
      albums.query.refetch(),
      playlists.query.refetch(),
    ]);
  };

  return {
    libraryItems,
    likedSongIds: idSets.song,
    isInLibrary,
    isLoading,
    isError,
    refetch,

    isSongDetailsLoading: songs.query.isPending,
    isArtistDetailsLoading: artists.query.isPending,
    isAlbumDetailLoading: albums.query.isPending,
    isPlaylistDetailLoading: playlists.query.isPending,

    addSong: songs.add.mutate,
    removeSong: songs.remove.mutate,
    isAddingSong: songs.add.isPending,
    isRemovingSong: songs.remove.isPending,

    addArtist: artists.add.mutate,
    removeArtist: artists.remove.mutate,
    isAddingArtist: artists.add.isPending,
    isRemovingArtist: artists.remove.isPending,

    addAlbum: albums.add.mutate,
    removeAlbum: albums.remove.mutate,
    isAddingAlbum: albums.add.isPending,
    isRemovingAlbum: albums.remove.isPending,

    addPlaylist: playlists.add.mutate,
    removePlaylist: playlists.remove.mutate,
    isAddingPlaylist: playlists.add.isPending,
    isRemovingPlaylist: playlists.remove.isPending,
  };
};
