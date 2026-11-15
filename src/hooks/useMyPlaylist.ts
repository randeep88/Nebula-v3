import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { backendAPI } from "../utils/backendAPI";
import { useToast } from "panelui-native";
import AppToast from "@/components/custom/Toast";

const useMyPlaylist = (id?: string) => {
  const [token, setToken] = useState<string | null>(null);
  const [isTokenLoading, setIsTokenLoading] = useState(true);
  const queryClient = useQueryClient();
  const { showToast } = AppToast();

  useEffect(() => {
    AsyncStorage.getItem("token").then((t) => {
      setToken(t);
      setIsTokenLoading(false);
    });
  }, []);

  const { data: playlist, isPending: loadingPlaylist } = useQuery({
    queryKey: ["my-playlists", id],
    queryFn: async () => {
      const res = await backendAPI.get(`/playlist/get/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!token && !isTokenLoading && !!id,
  });

  const {
    data: myPlaylists,
    isPending: loadingPlaylists,
    refetch: refetchPlaylists,
  } = useQuery({
    queryKey: ["my-playlists"],
    queryFn: async () => {
      const res = await backendAPI.get("/playlist/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    },
    enabled: !!token && !isTokenLoading,
  });

  const { mutateAsync: updatePlaylist, isPending: updatingPlaylist } =
    useMutation({
      mutationFn: async ({
        playlistId,
        name,
        coverImage,
      }: {
        playlistId: string;
        name: string;
        coverImage: string;
      }) => {
        if (isTokenLoading || !token) {
          throw new Error("Token not found");
        }

        const res = await backendAPI.patch(
          `/playlist/${playlistId}`,
          {
            name,
            coverImage,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        return res.data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["my-playlists"],
        });

        showToast({
          message: "Changes saved",
          variant: "success",
        });
      },
      onError: (err) => {
        console.log(err);
        showToast({
          message: "Couldn’t save changes. Try again.",
          variant: "destructive",
        });
      },
    });

  const { mutate: deletePlaylist, isPending: deletingPlaylist } = useMutation({
    mutationFn: async ({ playlistId }: { playlistId: string }) => {
      if (isTokenLoading || !token) {
        throw new Error("Token not found");
      }
      const res = await backendAPI.delete("/playlist/delete", {
        data: {
          playlistId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-playlists"] });

      showToast({
        message: "Playlist deleted",
        variant: "success",
      });
    },
    onError: (err) => {
      console.log(err);
      showToast({
        message: "Couldn’t delete playlist. Try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: createPlaylist, isPending: creatingPlaylist } = useMutation({
    mutationFn: async ({
      name,
      coverImage,
    }: {
      name: string;
      coverImage: string;
    }) => {
      if (isTokenLoading || !token) {
        throw new Error("Token not found");
      }
      const res = await backendAPI.post(
        "/playlist/create",
        {
          name,
          coverImage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-playlists"] });
      showToast({
        message: variables?.name
          ? `Created “${variables.name}”`
          : "Playlist created",
        variant: "success",
      });
    },
    onError: (err) => {
      console.log(err);
      showToast({
        message: "Couldn’t create playlist. Try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: addSong, isPending: addingSong } = useMutation({
    mutationFn: async ({
      playlistIds,
      songId,
    }: {
      playlistIds: string[];
      songId: string;
    }) => {
      if (isTokenLoading || !token) {
        throw new Error("Token not found");
      }
      const res = await backendAPI.post(
        "/playlist/add-song",
        {
          playlistIds,
          songId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return res.data.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-playlists"] });
      const count = variables?.playlistIds?.length ?? 1;
      showToast({
        message: `Song added to ${count} ${count === 1 ? "playlist" : "playlists"}`,
        variant: "success",
      });
    },
    onError: (err) => {
      console.log(err);
      showToast({
        message: "Couldn’t add song. Try again.",
        variant: "destructive",
      });
    },
  });

  const {
    mutate: removeSongFromPlaylist,
    isPending: removingSongFromPlaylist,
  } = useMutation({
    mutationFn: async ({
      playlistId,
      songId,
    }: {
      playlistId: string;
      songId: string;
    }) => {
      if (isTokenLoading || !token) {
        throw new Error("Token not found");
      }
      const res = await backendAPI.delete("/playlist/remove-song", {
        data: {
          playlistId,
          songId,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-playlists"] });
      showToast({
        message: "Song removed from playlist",
        variant: "success",
      });
    },
    onError: (err) => {
      console.log(err);
      showToast({
        message: "Couldn’t remove song. Try again.",
        variant: "destructive",
      });
    },
  });

  return {
    myPlaylists,
    loadingPlaylists,
    refetchPlaylists,
    createPlaylist,
    creatingPlaylist,
    addSong,
    addingSong,
    removeSongFromPlaylist,
    removingSongFromPlaylist,
    playlist,
    loadingPlaylist,
    deletePlaylist,
    deletingPlaylist,
    updatePlaylist,
    updatingPlaylist,
  };
};

export default useMyPlaylist;
