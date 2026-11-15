import { Chip } from "panelui-native";
import { Disc3, ListMusic, MicVocal } from "lucide-react-native";

const TrendingSearchCard = ({
  item,
  setSearchQuery,
}: {
  item: any;
  setSearchQuery: (query: string) => void;
}) => {
  return (
    <Chip
      className="text-center text-white"
      onPress={() => setSearchQuery(item.query)}
    >
      {item.type === "Artist" && <MicVocal size={15} color={item.color} />}
      {item.type === "Album" && <Disc3 size={15} color={item.color} />}
      {item.type === "Playlist" && <ListMusic size={15} color={item.color} />}
      {item.label}
    </Chip>
  );
};

export default TrendingSearchCard;
