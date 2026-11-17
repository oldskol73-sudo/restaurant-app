import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Body, Button, Card, EmptyState, Eyebrow, FadeIn, FoodImage, GoldDivider, Header, Heading, Screen, Tag } from '../../components/ui';
import { success } from '../../lib/feedback';
import { money } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import { fonts, radius, space, useColors } from '../../theme';

const when = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
  ' · ' +
  new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

export default function Account() {
  const c = useColors();
  const { state, reorder, rewardsInfo } = useStore();
  const { user, orders, menu, favorites, settings } = state;

  if (!user) {
    return (
      <Screen>
        <Header title="Account" eyebrow="Welcome" />
        <EmptyState
          icon="person-circle-outline"
          title="Sign in for the full experience"
          text="Save your favorite dishes, see past orders, reorder in one tap and earn rewards."
          action={
            <View style={{ gap: 10, alignItems: 'stretch', width: 240 }}>
              <Button title="Sign in / Sign up" onPress={() => router.push('/signin')} />
              <Button title="Staff access" variant="ghost" onPress={() => router.push('/staff-login')} />
            </View>
          }
        />
      </Screen>
    );
  }

  const info = rewardsInfo();
  const mine = orders.filter((o) => o.userId === user.id).sort((a, b) => b.createdAt - a.createdAt);
  const favItems = menu.filter((m) => favorites.includes(m.id) && !m.isAddOn);

  return (
    <Screen>
      <Header title="My Account" eyebrow="Welcome back" />
      <View style={{ paddingHorizontal: space.lg, gap: 22 }}>
        <FadeIn>
          <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
            <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: c.accentSoft, borderWidth: 1.5, borderColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: c.accent }}>{user.name.trim().charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Heading size={22}>{user.name}</Heading>
              <Body muted size={13}>
                {user.phone}
                {user.email ? ` · ${user.email}` : ''}
              </Body>
            </View>
            <Pressable onPress={() => router.push('/signin')} hitSlop={10}>
              <Ionicons name="create-outline" size={22} color={c.accent} />
            </Pressable>
          </Card>
        </FadeIn>

        {settings.rewardsEnabled ? (
          <FadeIn delay={80}>
            <Card onPress={() => router.push('/rewards')} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Ionicons name="gift" size={28} color={c.accent} />
              <View style={{ flex: 1, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontFamily: fonts.serifSemi, color: c.text, fontSize: 17 }}>Rewards</Text>
                  <Text style={{ fontFamily: fonts.sansSemi, color: c.accent, fontSize: 13 }}>
                    {info.available > 0 ? `${info.available} ready!` : `${info.points} pts`}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: c.surfaceHigh, borderRadius: 3, overflow: 'hidden' }}>
                  <View style={{ height: 6, width: `${Math.max(4, info.progress * 100)}%`, backgroundColor: c.accent }} />
                </View>
                <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5 }}>
                  {info.toNext} more {info.toNext === 1 ? 'order' : 'orders'} to {settings.rewardName.toLowerCase()}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={c.muted} />
            </Card>
          </FadeIn>
        ) : null}

        <View>
          <Eyebrow>Saved</Eyebrow>
          <Heading size={24} style={{ marginTop: 4, marginBottom: 12 }}>
            Favorites
          </Heading>
          {favItems.length === 0 ? (
            <Body muted size={14}>
              Tap the ♡ on any dish and it’ll wait for you here.
            </Body>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {favItems.map((m) => (
                <Pressable key={m.id} onPress={() => router.push(`/meal/${m.id}`)} style={{ width: 160 }}>
                  <FoodImage uri={m.photo} style={{ height: 110 }} radiusValue={radius.md} />
                  <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 14, marginTop: 8 }}>
                    {m.name}
                  </Text>
                  <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 13 }}>{money(m.price)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <GoldDivider diamond />

        <View style={{ gap: 12 }}>
          <View>
            <Eyebrow>History</Eyebrow>
            <Heading size={24} style={{ marginTop: 4 }}>
              Past Orders
            </Heading>
          </View>
          {mine.length === 0 ? (
            <Body muted size={14}>
              Your orders will show up here.
            </Body>
          ) : (
            mine.slice(0, 15).map((o) => (
              <Card key={o.id} style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.serifSemi, color: c.text, fontSize: 18 }}>Order #{o.number}</Text>
                  <Tag label={o.status === 'completed' ? 'Picked up' : o.status} tone={o.status === 'completed' ? 'muted' : 'gold'} />
                </View>
                <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5 }}>{when(o.createdAt)}</Text>
                <Text numberOfLines={2} style={{ fontFamily: fonts.sans, color: c.text, fontSize: 14, lineHeight: 20 }}>
                  {o.lines.map((l) => `${l.qty}× ${l.name}`).join(', ')}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 18 }}>{money(o.total)}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {o.status !== 'completed' ? <Button small variant="ghost" title="Track" onPress={() => router.push(`/order/${o.id}`)} /> : null}
                    <Button
                      small
                      variant="outline"
                      icon="repeat"
                      title="Order again"
                      onPress={() => {
                        const n = reorder(o);
                        success();
                        if (n > 0) router.push('/cart');
                      }}
                    />
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        <View style={{ gap: 6 }}>
          <Button title="Sign out" variant="ghost" onPress={() => router.push('/signin')} />
          <Button title="Restaurant staff" variant="ghost" onPress={() => router.push('/staff-login')} />
        </View>
      </View>
    </Screen>
  );
}
