import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { select } from '../../lib/feedback';
import { useStore } from '../../lib/store';
import { fonts, useColors } from '../../theme';

export default function TabsLayout() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const {
    state: { cart },
  } = useStore();
  const count = cart.reduce((s, l) => s + l.qty, 0);

  const icon =
    (on: React.ComponentProps<typeof Ionicons>['name'], off: React.ComponentProps<typeof Ionicons>['name']) =>
    ({ color, focused }: { color: import("react-native").ColorValue; focused: boolean }) => <Ionicons name={focused ? on : off} size={23} color={color as string} />;

  return (
    <Tabs
      screenListeners={{ tabPress: () => select() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: { fontFamily: fonts.sansMed, fontSize: 11, letterSpacing: 0.4, marginTop: 2, marginBottom: 2 },
        tabBarItemStyle: { paddingTop: 2 },
        tabBarStyle: {
          backgroundColor: '#18181A',
          borderTopColor: c.line,
          borderTopWidth: 1,
          height: 72 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen name="menu" options={{ title: 'Menu', tabBarIcon: icon('restaurant', 'restaurant-outline') }} />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Order',
          tabBarIcon: icon('bag-handle', 'bag-handle-outline'),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: c.wine, color: c.text, fontFamily: fonts.sansSemi, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="rewards" options={{ title: 'Rewards', tabBarIcon: icon('gift', 'gift-outline') }} />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: icon('person', 'person-outline') }} />
    </Tabs>
  );
}
