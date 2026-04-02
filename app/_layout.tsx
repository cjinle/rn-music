import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        title: '音乐 App',
        headerLeft: () => (
          <View style={{ marginLeft: 10, flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24 }}>🎵</Text>
          </View>
        ),
      }}
    />
  );
}
