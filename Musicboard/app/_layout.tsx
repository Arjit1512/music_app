import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name="artist" options={{ headerShown: false }} />
      <Stack.Screen name="[albumId]" options={{ headerShown: false }} />
      <Stack.Screen name="rating" options={{ headerShown: false }} />
    
    </Stack>
  );
}