import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
      <Stack.Screen name="artist" options={{ headerShown: false }} />
      <Stack.Screen name="album/[albumId]" options={{ headerShown: false }} />
      <Stack.Screen name="song/[songId]" options={{headerShown:false}} />
      <Stack.Screen name="rating" options={{ headerShown: false }} />
      <Stack.Screen name="allyourratings" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="more" options={{headerShown: false}} />
    </Stack>
  );
}