import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { success } from '../lib/feedback';
import { useStore } from '../lib/store';
import { fonts, shadow, useColors } from '../theme';

/** In-app "push notification" banner shown when staff mark this phone's order Ready. */
export function ReadyAlert() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { state, markAlertSeen } = useStore();
  const order = state.orders.find((o) => o.mine && o.status === 'ready' && !o.alertSeen && o.notify !== 'text');
  const y = useRef(new Animated.Value(-160)).current;

  useEffect(() => {
    if (order) {
      success();
      Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 16, stiffness: 150 }).start();
      const t = setTimeout(() => markAlertSeen(order.id), 9000);
      return () => clearTimeout(t);
    }
    y.setValue(-160);
  }, [order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) return null;
  return (
    <Animated.View style={{ position: 'absolute', left: 12, right: 12, top: insets.top + 8, transform: [{ translateY: y }], zIndex: 50 }}>
      <Pressable
        onPress={() => {
          markAlertSeen(order.id);
          router.push({ pathname: '/order/[id]', params: { id: order.id } });
        }}
        style={[{ backgroundColor: c.surfaceHigh, borderRadius: 18, borderWidth: 1, borderColor: c.accent, padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }, shadow]}
      >
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="bag-check" size={22} color="#0A0A0A" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 14.5 }}>Order #{order.number} is ready!</Text>
          <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, marginTop: 2 }}>
            {state.settings.name} · Come to the counter for pickup
          </Text>
        </View>
        <View>
          <Ionicons name="chevron-forward" size={18} color={c.muted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}
