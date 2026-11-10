import { useQuery } from "@tanstack/react-query";
import { api } from "../utils/api";

const useSuggestedSongs = (songId: string) => {

  console.log(songId)
  const {
    data: suggestedSongs,
    isPending,
    refetch: refetchSuggestedSongs,
  } = useQuery({
    queryKey: ["suggested-songs", songId],
    queryFn: async () => {
      const res = await api.get(`/songs/${songId}/suggestions?limit=50`);

      console.log(res)
      return res.data.data;
    },
  });

  return { suggestedSongs, isPending, refetchSuggestedSongs };
};

export default useSuggestedSongs;
