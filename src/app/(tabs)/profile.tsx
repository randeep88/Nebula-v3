import { View, ScrollView } from 'react-native'
import React from 'react'
import { Text } from 'panelui-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
      const insets = useSafeAreaInsets();
  return (
   <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{
        paddingTop: insets.top + 16,
        paddingBottom: 40,
        paddingHorizontal: 16,
        gap: 28,
      }}
    >
      <View className="gap-1">
        <Text size="3xl" weight="bold">
          Profile
        </Text>
        <Text muted>
          A dozen of the eighty. None of them names a colour — change the theme
          in Settings and watch every one of them follow.
        </Text>
      </View>
      </ScrollView>
  )
}

export default ProfileScreen