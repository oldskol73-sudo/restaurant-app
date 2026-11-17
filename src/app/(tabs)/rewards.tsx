import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Card, EmptyState, Eyebrow, FadeIn, GoldDivider, Header, Heading, Screen } from '../../components/ui';
import { useStore } from '../../lib/store';
import { fonts, radius, space, useColors } from '../../theme';

export default function Rewards() {
  const c = useColors();
  const { state, rewardsInfo } = useStore();
  const { settings, user } = state;
  const info = rewardsInfo();
  const per = Math.max(1, settings.ordersPerReward);
  const filled = info.orders % per;

  if (!settings.rewardsEnabled) {
    return (
      <Screen>
        <Header title="Rewards" eyebrow="Loyalty" />
        <EmptyState icon="gift-outline" title="Rewards are coming soon" text="Check back soon for ways to earn at our restaurant." />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Rewards" eyebrow="Loyalty" subtitle={`Every ${per} orders earns ${settings.rewardName.toLowerCase()}.`} />
      <View style={{ paddingHorizontal: space.lg, gap: 18 }}>
        {!user ? (
          <FadeIn>
            <Card style={{ borderColor: c.accent, gap: 12 }}>
              <Heading size={22}>Start earning today</Heading>
              <Body muted>Create a free account and every pickup order counts toward your next reward — even ones you place as a guest.</Body>
              <Button title="Sign in / Create account" onPress={() => router.push('/signin')} />
            </Card>
          </FadeIn>
        ) : null}

        <FadeIn delay={80}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 22 }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 44, color: c.accent }}>{info.points.toLocaleString()}</Text>
              <Eyebrow>Points</Eyebrow>
              <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>{settings.pointsPerDollar} per $1</Text>
            </Card>
            <Card style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 22, backgroundColor: info.available ? c.accentSoft : c.surface, borderColor: info.available ? c.accent : c.line }}>
              <Text style={{ fontFamily: fonts.serif, fontSize: 44, color: c.text }}>{info.available}</Text>
              <Eyebrow>{info.available === 1 ? 'Reward ready' : 'Rewards ready'}</Eyebrow>
              <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>{info.earned} earned</Text>
            </Card>
          </View>
        </FadeIn>

        <FadeIn delay={160}>
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Heading size={20}>Your punch card</Heading>
              <Text style={{ fontFamily: fonts.sansMed, color: c.muted, fontSize: 13 }}>
                {user ? `${filled} of ${per}` : `0 of ${per}`}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
              {Array.from({ length: per }).map((_, i) => {
                const on = !!user && i < filled;
                const last = i === per - 1;
                return (
                  <View
                    key={i}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      borderWidth: 1.5,
                      borderColor: c.accent,
                      backgroundColor: on ? c.accent : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderStyle: on ? 'solid' : 'dashed',
                    }}
                  >
                    {on ? <Ionicons name="checkmark" size={26} color="#1C1C1E" /> : last ? <Ionicons name="gift-outline" size={22} color={c.accent} /> : <Text style={{ fontFamily: fonts.serif, color: c.muted, fontSize: 17 }}>{i + 1}</Text>}
                  </View>
                );
              })}
            </View>
            <GoldDivider />
            <Body muted size={13.5} style={{ textAlign: 'center' }}>
              {user
                ? info.toNext === per && info.orders > 0
                  ? `You just earned a reward! Use it at checkout.`
                  : `${info.toNext} more ${info.toNext === 1 ? 'order' : 'orders'} until: ${settings.rewardName}`
                : 'Sign in to start your punch card.'}
            </Body>
          </Card>
        </FadeIn>

        <FadeIn delay={240}>
          <Card style={{ gap: 12 }}>
            <Heading size={20}>Rewards available</Heading>
            {info.available > 0 ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: c.accentSoft, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: c.accent }}>
                <Ionicons name="gift" size={28} color={c.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.serifSemi, color: c.text, fontSize: 17 }}>{settings.rewardName}</Text>
                  <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 13, marginTop: 2 }}>
                    {info.available > 1 ? `${info.available} available · ` : ''}Apply it at checkout
                  </Text>
                </View>
              </View>
            ) : (
              <Body muted size={14}>
                No rewards ready yet — keep ordering and your next one will show up here.
              </Body>
            )}
            <Button title="Order now" variant="outline" onPress={() => router.push('/menu')} />
          </Card>
        </FadeIn>
      </View>
    </Screen>
  );
}
