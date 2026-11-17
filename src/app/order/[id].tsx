import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, Text, View } from 'react-native';
import { Banner, Body, Button, Card, EmptyState, Eyebrow, FadeIn, GoldDivider, Heading, Row, Screen, Tag } from '../../components/ui';
import { success } from '../../lib/feedback';
import { money } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import type { OrderStatus } from '../../lib/types';
import { fonts, radius, space, useColors } from '../../theme';

const STEPS: { id: OrderStatus; title: string; sub: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { id: 'received', title: 'Received', sub: 'We have your order', icon: 'checkmark-done-outline' },
  { id: 'preparing', title: 'Being Prepared', sub: 'The kitchen is on it', icon: 'flame-outline' },
  { id: 'ready', title: 'Ready for Pickup', sub: 'Come on in — it’s hot', icon: 'bag-check-outline' },
];

function Pulse({ children, active }: { children: React.ReactNode; active: boolean }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, v]);
  return <Animated.View style={{ transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] }) }] }}>{children}</Animated.View>;
}

export default function OrderStatusScreen() {
  const c = useColors();
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const { state, markAlertSeen } = useStore();
  const { settings, user } = state;
  const order = state.orders.find((o) => o.id === id);
  const ready = order?.status === 'ready';

  useEffect(() => {
    if (order && ready && !order.alertSeen) {
      success();
      markAlertSeen(order.id);
    }
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!order) {
    return (
      <Screen>
        <EmptyState icon="receipt-outline" title="Order not found" text="We couldn’t find that order." action={<Button title="Go to menu" onPress={() => router.replace('/menu')} />} />
      </Screen>
    );
  }

  const idx = order.status === 'completed' ? 3 : STEPS.findIndex((s) => s.id === order.status);
  const done = order.status === 'completed';
  const canCreateAccount = !user && order.mine;

  return (
    <Screen>
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, gap: 22 }}>
        <Pressable onPress={() => router.replace('/')} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Ionicons name="home-outline" size={18} color={c.accent} />
          <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 14 }}>Home</Text>
        </Pressable>

        <FadeIn style={{ alignItems: 'center', gap: 8 }}>
          {fresh ? (
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 6 }}>
              <Ionicons name="checkmark" size={36} color="#1C1C1E" />
            </View>
          ) : null}
          <Eyebrow>{fresh ? 'Thank you, ' + order.name.split(' ')[0] : 'Order status'}</Eyebrow>
          <Text style={{ fontFamily: fonts.serif, fontSize: 58, color: c.text, lineHeight: 68 }}>#{order.number}</Text>
          <Body muted style={{ textAlign: 'center' }}>
            Pickup at {settings.name}
            {'\n'}
            {settings.address}
          </Body>
        </FadeIn>

        {ready ? (
          <FadeIn>
            <Banner tone="gold" icon="notifications" text={`Your order is ready for pickup! Come to the counter and say “#${order.number}”.`} />
          </FadeIn>
        ) : null}

        <GoldDivider diamond />

        <View style={{ gap: 0 }}>
          {STEPS.map((s, i) => {
            const complete = i < idx || done;
            const current = i === idx && !done;
            return (
              <FadeIn key={s.id} delay={i * 120} style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ alignItems: 'center' }}>
                  <Pulse active={current}>
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: complete || current ? c.accent : c.surface,
                        borderWidth: 1.5,
                        borderColor: complete || current ? c.accent : c.line,
                      }}
                    >
                      <Ionicons name={complete ? 'checkmark' : s.icon} size={22} color={complete || current ? '#1C1C1E' : c.muted} />
                    </View>
                  </Pulse>
                  {i < STEPS.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 34, backgroundColor: complete ? c.accent : c.line }} /> : null}
                </View>
                <View style={{ flex: 1, paddingTop: 6, paddingBottom: 22 }}>
                  <Text style={{ fontFamily: fonts.serifSemi, fontSize: 19, color: complete || current ? c.text : c.muted }}>{s.title}</Text>
                  <Text style={{ fontFamily: fonts.sans, fontSize: 13.5, color: c.muted, marginTop: 2 }}>
                    {current ? s.sub : complete ? 'Done' : 'Up next'}
                  </Text>
                </View>
              </FadeIn>
            );
          })}
        </View>

        {done ? <Banner tone="gold" icon="happy-outline" text="Picked up — thank you! We hope you loved it." /> : null}

        <Card style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Heading size={20}>Your order</Heading>
            {order.payment === 'cash' && !order.paid ? <Tag label="Pay cash at pickup" tone="wine" /> : <Tag label={order.payment === 'paypal' ? 'Paid · PayPal' : 'Paid · Cash'} tone="green" />}
          </View>
          {order.lines.map((l, i) => (
            <View key={i} style={{ paddingVertical: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ flex: 1, fontFamily: fonts.sansMed, color: c.text, fontSize: 14.5 }}>
                  {l.qty} × {l.name}
                </Text>
                <Text style={{ fontFamily: fonts.sansMed, color: c.text, fontSize: 14 }}>{money(l.unitPrice * l.qty)}</Text>
              </View>
              {l.options.length || l.extras.length ? (
                <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, marginTop: 2 }}>
                  {[...l.options, ...l.extras.map((e) => '+ ' + e.name)].join(' · ')}
                </Text>
              ) : null}
              {l.note ? <Text style={{ fontFamily: fonts.sans, color: c.accent, fontSize: 12.5, marginTop: 2, fontStyle: 'italic' }}>“{l.note}”</Text> : null}
            </View>
          ))}
          <GoldDivider style={{ marginVertical: 8 }} />
          <Row label="Subtotal" value={money(order.subtotal)} />
          {order.discount > 0 ? <Row label="Reward" value={`− ${money(order.discount)}`} valueColor={c.success} /> : null}
          <Row label="Tax" value={money(order.tax)} />
          <Row label="Total" value={money(order.total)} bold />
        </Card>

        <Body muted size={13} style={{ textAlign: 'center' }}>
          {order.notify === 'app' ? 'We’ll send an app alert when it’s ready.' : order.notify === 'text' ? `We’ll text ${order.phone} when it’s ready.` : `We’ll send an app alert and text ${order.phone} when it’s ready.`}
        </Body>

        {canCreateAccount ? (
          <FadeIn>
            <Card style={{ borderColor: c.accent, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Ionicons name="gift-outline" size={26} color={c.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.serifSemi, color: c.text, fontSize: 18 }}>Create an account?</Text>
                  <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 13, marginTop: 2 }}>
                    Count this order toward {settings.rewardName.toLowerCase()}, save favorites and reorder in one tap.
                  </Text>
                </View>
              </View>
              <Button title="Create account" small onPress={() => router.push('/signin')} />
            </Card>
          </FadeIn>
        ) : null}

        <View style={{ gap: 10 }}>
          <Button title="Order something else" variant="outline" onPress={() => router.replace('/menu')} />
          <Pressable onPress={() => router.push('/staff-login')} style={{ alignSelf: 'center', padding: 8 }}>
            <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12, textAlign: 'center' }}>
              Preview tip: open <Text style={{ color: c.accent }}>Staff view</Text> to move this order along
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
