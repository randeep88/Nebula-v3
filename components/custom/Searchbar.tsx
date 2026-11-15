import { useState } from "react";
import { Pressable, View } from "react-native";
import { InputGroup, SearchIcon } from "panelui-native";
import { X } from "lucide-react-native";

type SearchbarProps = {
  value: string;
  onChange: (text: string) => void;
  onSubmit?: () => void;
};

const Searchbar = ({ onChange, value, onSubmit }: SearchbarProps) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      <InputGroup>
        <InputGroup.Prefix isDecorative>
          <SearchIcon size={16} color="#444" />
        </InputGroup.Prefix>

        <InputGroup.Input
          value={value}
          onChangeText={onChange}
          className="bg-white text-black font-medium"
          placeholder="What do you want to listen to?"
          placeholderTextColor="#444"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {isFocused && value != "" && (
          <InputGroup.Suffix>
            <Pressable onPress={() => onChange("")} hitSlop={10}>
              <X size={18} color="#444" />
            </Pressable>
          </InputGroup.Suffix>
        )}
      </InputGroup>
    </View>
  );
};

export default Searchbar;
