import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold, useFonts } from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReadyAlert } from '../components/ReadyAlert';
import { StoreProvider, useStore } from '../lib/store';
import { useColors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const c = useColors();
  const {
    state: { hydrated },
  } = useStore();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const ready = fontsLoaded && hydrated;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: c.background }} />;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: c.background },
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="kitchen" options={{ animation: 'fade' }} />
        <Stack.Screen name="shop/[id]" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="bag" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(staff)" options={{ animation: 'fade' }} />
        <Stack.Screen name="meal/[id]" options={{ animation: 'slide_from_bottom', presentation: 'card' }} />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="edit-item" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="order/[id]" options={{ animation: 'fade' }} />
        <Stack.Screen name="signin" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="staff-login" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
      <ReadyAlert />
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
