import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Banner, Body, Button, Eyebrow, FadeIn, FoodImage, GoldDivider, Heading, Logo } from '../components/ui';
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
  const hero = menu.find((m) => m.id === 'ribeye')?.photo ?? menu.find((m) => m.photo)?.photo;
  const activeOrder = orders.find((o) => o.mine && o.status !== 'completed');

  const openMaps = () => {
    const q = encodeURIComponent(settings.address);
    Linking.openURL(
      Platform.OS === 'ios' ? `http://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`,
    ).catch(() => {});
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={StyleSheet.absoluteFill}>
        <FoodImage uri={hero} radiusValue={0} showIcon={false} style={{ height: '58%' }} transition={900} />
        <LinearGradient
          colors={['rgba(28,28,30,0.35)', 'rgba(28,28,30,0.78)', c.background]}
          locations={[0, 0.45, 0.62]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={{ flex: 1, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16, paddingHorizontal: space.lg }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <FadeIn>
            <Logo size={112} />
          </FadeIn>
          <FadeIn delay={150} style={{ alignItems: 'center', marginTop: 22 }}>
            <Heading size={40} style={{ textAlign: 'center' }}>
              {settings.name}
            </Heading>
            <Eyebrow style={{ marginTop: 10, textAlign: 'center' }}>{settings.tagline}</Eyebrow>
          </FadeIn>
          <FadeIn delay={300} style={{ width: '70%', marginTop: 22 }}>
            <GoldDivider diamond />
          </FadeIn>
        </View>

        <FadeIn delay={450} style={{ gap: 14, marginBottom: 22 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <View
              style={{
                width: 9,
                height: 9,
                borderRadius: 5,
                backgroundColor: open && !settings.paused ? c.success : c.wine,
              }}
            />
            <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 14 }}>
              {settings.paused ? 'Online ordering paused' : open ? 'Open now' : 'Closed right now'}
              <Text style={{ fontFamily: fonts.sans, color: c.muted }}>{`  ·  Today ${hoursLabel(today)}`}</Text>
            </Text>
          </View>
          <Pressable onPress={openMaps} style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="location-outline" size={16} color={c.accent} />
            <Body muted size={13.5} style={{ textAlign: 'center' }}>
              {settings.address}
            </Body>
          </Pressable>
          <Body muted size={12} style={{ textAlign: 'center', letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Pickup only · Pay with PayPal or cash at the counter
          </Body>
        </FadeIn>

        {settings.paused ? (
          <FadeIn delay={500} style={{ marginBottom: 14 }}>
            <Banner icon="pause-circle-outline" text="The kitchen is catching up. You can browse the menu, but new orders are paused for now." />
          </FadeIn>
        ) : null}

        <FadeIn delay={600} style={{ gap: 12 }}>
          {activeOrder ? (
            <Button
              title={`Track order #${activeOrder.number}`}
              icon="receipt-outline"
              variant="wine"
              onPress={() => router.push(`/order/${activeOrder.id}`)}
            />
          ) : null}
          <Button title="Start Order" icon="restaurant-outline" onPress={() => router.push('/menu')} />
          {user ? (
            <Button title={`Hi, ${user.name.split(' ')[0]} — My Account`} variant="outline" onPress={() => router.push('/account')} />
          ) : (
            <Button title="Sign In" variant="outline" onPress={() => router.push('/signin')} />
          )}
          <Pressable
            onPress={() => router.push('/menu')}
            style={{ alignItems: 'center', paddingVertical: 4 }}
            hitSlop={8}
          >
            <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 13 }}>
              No account needed — <Text style={{ color: c.accent, fontFamily: fonts.sansMed }}>continue as guest</Text>
            </Text>
          </Pressable>
        </FadeIn>

        <Pressable
          onPress={() => router.push('/staff-login')}
          style={{ alignSelf: 'center', marginTop: 12, flexDirection: 'row', gap: 6, alignItems: 'center', padding: 6 }}
        >
          <Ionicons name="lock-closed-outline" size={12} color={c.muted} />
          <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>Restaurant staff</Text>
        </Pressable>
      </View>
    </View>
  );
}
