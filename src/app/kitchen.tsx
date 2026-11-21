import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, Body, Button, FadeIn, FoodImage, NavPill, PlateHero, StatBar } from '../components/ui';
import { restaurant } from '../../restaurant.config';
import { hoursLabel, isOpenNow, todayHours } from '../lib/hours';
import { useStore } from '../lib/store';
import { fonts, space, useColors } from '../theme';

export default function KitchenWelcome() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { state } = useStore();
  const { settings, user, menu, orders } = state;
  const open = isOpenNow(settings.hours);
  const today = todayHours(settings.hours);
  const activeOrder = orders.find((o) => o.mine && o.status !== 'completed');

  const openMaps = () => {
    const q = encodeURIComponent(settings.address);
    Linking.openURL(
      Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`,
    ).catch(() => {});
  };

  const stats = [
    // Not open today: show the first day the cafe is open instead
    today
      ? { label: 'Today', value: hoursLabel(today).replace(/ /g, '').replace('–', '-') }
      : { label: 'Open', value: `${settings.hours[0]?.day.slice(0, 3) ?? ''} ${hoursLabel(settings.hours[0]).replace(/ /g, '').replace('–', '-')}`.trim() },
    { label: 'Pickup', value: 'Only' },
    { label: 'Pay', value: 'PayPal' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <LinearGradient
        colors={['transparent', 'rgba(255,120,20,0.28)', 'rgba(255,159,28,0.10)', 'transparent']}
        locations={[0.2, 0.55, 0.8, 1]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24, paddingHorizontal: space.lg }}>
        <FadeIn style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: c.accent, padding: 2 }}>
              <FoodImage uri={require('../../assets/Store-Emblem.png')} style={{ flex: 1 }} radiusValue={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontFamily: fonts.serif, color: c.text, fontSize: 16 }}>{settings.name}</Text>
              <Text numberOfLines={1} style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 10.5 }}>{settings.tagline}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <NavPill label="Store" icon="home-outline" onPress={() => router.replace('/')} />
            {user ? <NavPill label="Account" onPress={() => router.push('/account')} /> : <NavPill label="Sign in" filled onPress={() => router.push('/signin')} />}
          </View>
        </FadeIn>

        <FadeIn delay={120} style={{ marginTop: 34 }}>
          <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 52, lineHeight: 58 }}>{restaurant.heroLine1}</Text>
          <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 52, lineHeight: 58 }}>{restaurant.heroLine2}</Text>
          <Body size={15} style={{ marginTop: 14, maxWidth: 300 }}>{restaurant.heroSub}</Body>
          <View style={{ height: 2, width: 190, backgroundColor: c.text, marginTop: 14 }} />
        </FadeIn>

        <FadeIn delay={260} style={{ alignItems: 'center', marginTop: 30 }}>
          <PlateHero uri={require('../../assets/Sweet-savor.jpg')} size={270} />
        </FadeIn>

        <FadeIn delay={380} style={{ marginTop: 30, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: open && !settings.paused ? c.success : c.wine }} />
            <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 13.5 }}>
              {settings.paused ? 'Online ordering paused' : open ? 'Open now' : 'Closed right now'}
            </Text>
          </View>
          <StatBar items={stats} />
          <Pressable onPress={openMaps} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="location-outline" size={16} color={c.accent} />
            <Body muted size={13.5} style={{ textAlign: 'center' }}>{settings.address}</Body>
          </Pressable>
        </FadeIn>

        {settings.paused ? (
          <View style={{ marginTop: 14 }}>
            <Banner icon="pause-circle-outline" text="The kitchen is catching up. You can browse the menu, but new orders are paused for now." />
          </View>
        ) : null}

        <FadeIn delay={500} style={{ gap: 12, marginTop: 22 }}>
          {activeOrder ? (
            <Button title={`Track order #${activeOrder.number}`} icon="receipt-outline" variant="wine" onPress={() => router.push(`/order/${activeOrder.id}`)} />
          ) : null}
          <Button title="Start Order" icon="restaurant-outline" onPress={() => router.push('/menu')} />
          <Button title="Explore the menu" variant="outline" onPress={() => router.push('/menu')} />
          <Text style={{ textAlign: 'center', fontFamily: fonts.sans, color: c.muted, fontSize: 13 }}>
            No account needed — <Text style={{ color: c.accent, fontFamily: fonts.sansMed }} onPress={() => router.push('/menu')}>continue as guest</Text>
          </Text>
        </FadeIn>

        <Pressable onPress={() => router.push('/staff-login')} style={{ alignSelf: 'center', marginTop: 12, flexDirection: 'row', gap: 6, alignItems: 'center', padding: 6 }}>
          <Ionicons name="lock-closed-outline" size={12} color={c.muted} />
          <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>Restaurant staff</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
