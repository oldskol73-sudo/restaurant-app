import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, KeyboardAvoidingView, Modal, Platform, Pressable, Switch, Text, View } from 'react-native';
import { payments } from '../../restaurant.config';
import { Banner, Body, Button, Card, Eyebrow, FadeIn, Field, GoldDivider, Header, Row, Screen } from '../components/ui';
import { select, success, warn } from '../lib/feedback';
import { isOpenNow } from '../lib/hours';
import { cartTotals, findItem, lineUnitPrice, money } from '../lib/pricing';
import { registerForPush } from '../lib/push';
import { useStore } from '../lib/store';
import type { NotifyChoice, PaymentType } from '../lib/types';
import { fonts, radius, space, useColors } from '../theme';

/**
 * Demo PayPal sheet. It looks and behaves like a PayPal approval step so you can
 * test the whole flow. To take real payments, swap the body of `PayPalSheet`
 * for PayPal's checkout (see README → "Going live with PayPal").
 */
function PayPalSheet({ visible, amount, onApprove, onCancel }: { visible: boolean; amount: number; onApprove: () => void; onCancel: () => void }) {
  const c = useColors();
  const [busy, setBusy] = useState(false);
  const slide = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      setBusy(false);
      slide.setValue(0);
      Animated.spring(slide, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 140 }).start();
    }
  }, [visible, slide]);

  const approve = () => {
    setBusy(true);
    setTimeout(onApprove, 1300);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: c.overlay, justifyContent: 'flex-end' }}>
        <Animated.View
          style={{
            backgroundColor: '#FFFFFF',
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            padding: 24,
            paddingBottom: 36,
            gap: 16,
            transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [380, 0] }) }],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fonts.sansSemi, fontSize: 26, color: '#003087', fontStyle: 'italic' }}>
              Pay<Text style={{ color: '#009CDE' }}>Pal</Text>
            </Text>
            <Pressable onPress={onCancel} hitSlop={10} disabled={busy}>
              <Ionicons name="close" size={24} color="#555" />
            </Pressable>
          </View>
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: fonts.sans, color: '#555', fontSize: 14 }}>Pay {payments.paypalBusinessName}</Text>
            <Text style={{ fontFamily: fonts.sansSemi, color: '#111', fontSize: 34 }}>{money(amount)}</Text>
            <Text style={{ fontFamily: fonts.sans, color: '#777', fontSize: 12.5 }}>
              Demo checkout — no real money is moved in this preview.
            </Text>
          </View>
          <Pressable
            onPress={approve}
            disabled={busy}
            style={{ backgroundColor: '#FFC439', borderRadius: 999, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }}
          >
            {busy ? (
              <ActivityIndicator color="#003087" />
            ) : (
              <Text style={{ fontFamily: fonts.sansSemi, fontSize: 17, color: '#003087', fontStyle: 'italic' }}>
                Pay with Pay<Text style={{ color: '#009CDE' }}>Pal</Text>
              </Text>
            )}
          </Pressable>
          <Text style={{ textAlign: 'center', fontFamily: fonts.sans, color: '#777', fontSize: 12 }}>
            {busy ? 'Confirming your payment…' : 'You’ll return to the app right after.'}
          </Text>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function Checkout() {
  const c = useColors();
  const { state, placeOrder, rewardsInfo, discountFor } = useStore();
  const { cart, menu, settings, user } = state;
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [payment, setPayment] = useState<PaymentType>('paypal');
  const [notify, setNotify] = useState<NotifyChoice>('both');
  const [useReward, setUseReward] = useState(false);
  const [err, setErr] = useState('');
  const [showPay, setShowPay] = useState(false);
  const placing = useRef(false);

  const info = rewardsInfo();
  const canReward = settings.rewardsEnabled && !!user && info.available > 0;
  const discount = discountFor(canReward && useReward);
  const totals = cartTotals(menu, cart, settings.taxRatePercent, discount);
  const open = isOpenNow(settings.hours);

  useEffect(() => {
    if (cart.length === 0 && !placing.current) router.replace('/cart');
  }, [cart.length]);

  const finish = async () => {
    if (placing.current) return;
    placing.current = true;
    const pushToken = notify === 'text' ? null : await registerForPush();
    const order = placeOrder({ name, phone, payment, notify, useReward: canReward && useReward, pushToken: pushToken ?? undefined });
    success();
    setShowPay(false);
    router.replace({ pathname: '/order/[id]', params: { id: order.id, fresh: '1' } });
  };

  const submit = () => {
    if (settings.paused) return setErr('Online ordering is paused right now.');
    if (name.trim().length < 2) return setErr('Please add your name so we can call it out at pickup.');
    if (notify !== 'app' && phone.replace(/\D/g, '').length < 7) return setErr('Add a phone number so we can text you when your order is ready.');
    if (phone.replace(/\D/g, '').length < 7) return setErr('Please add a phone number.');
    setErr('');
    if (payment === 'paypal') setShowPay(true);
    else finish();
  };

  const PayOption = ({ id, title, sub, icon }: { id: PaymentType; title: string; sub: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) => {
    const on = payment === id;
    return (
      <Pressable
        onPress={() => {
          select();
          setPayment(id);
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 16,
          borderRadius: radius.md,
          borderWidth: on ? 1.5 : 1,
          borderColor: on ? c.accent : c.line,
          backgroundColor: on ? c.accentSoft : c.surface,
        }}
      >
        <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={22} color={c.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: fonts.sansSemi, fontSize: 15.5, color: c.text }}>{title}</Text>
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: c.muted, marginTop: 2 }}>{sub}</Text>
        </View>
        <Ionicons name={on ? 'radio-button-on' : 'radio-button-off'} size={22} color={on ? c.accent : c.muted} />
      </Pressable>
    );
  };

  const NotifyOption = ({ id, label, icon }: { id: NotifyChoice; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }) => {
    const on = notify === id;
    return (
      <Pressable
        onPress={() => {
          select();
          setNotify(id);
        }}
        style={{
          flex: 1,
          alignItems: 'center',
          gap: 6,
          paddingVertical: 14,
          borderRadius: radius.md,
          borderWidth: on ? 1.5 : 1,
          borderColor: on ? c.accent : c.line,
          backgroundColor: on ? c.accentSoft : c.surface,
        }}
      >
        <Ionicons name={icon} size={20} color={on ? c.accent : c.muted} />
        <Text style={{ fontFamily: fonts.sansMed, fontSize: 12.5, color: on ? c.text : c.muted }}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Header back title="Checkout" eyebrow="Almost there" subtitle="Pickup only — we’ll alert you the moment it’s ready." />
        <View style={{ paddingHorizontal: space.lg, gap: 22 }}>
          {!open ? <Banner tone="gold" icon="time-outline" text="We’re outside regular hours right now. You can still place your order and the kitchen will see it as soon as they’re in." /> : null}

          <FadeIn>
            <Card>
              {cart.map((l) => {
                const it = findItem(menu, l.itemId);
                if (!it) return null;
                return (
                  <View key={l.key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text style={{ flex: 1, fontFamily: fonts.sans, color: c.text, fontSize: 14 }} numberOfLines={1}>
                      {l.qty} × {it.name}
                    </Text>
                    <Text style={{ fontFamily: fonts.sansMed, color: c.muted, fontSize: 14 }}>{money(lineUnitPrice(menu, l) * l.qty)}</Text>
                  </View>
                );
              })}
            </Card>
          </FadeIn>

          <View style={{ gap: 14 }}>
            <Eyebrow>Your details</Eyebrow>
            <Field label="Name for the order" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
            <Field label="Mobile phone" value={phone} onChangeText={setPhone} placeholder="(555) 555-5555" keyboardType="phone-pad" />
          </View>

          <View style={{ gap: 12 }}>
            <Eyebrow>How would you like to pay?</Eyebrow>
            <PayOption id="paypal" title="PayPal" sub="Pay securely in the app" icon="logo-paypal" />
            <PayOption id="cash" title="Pay Cash at Pickup" sub="Pay at the counter when you collect" icon="cash-outline" />
          </View>

          <View style={{ gap: 12 }}>
            <Eyebrow>Notify me when it’s ready</Eyebrow>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <NotifyOption id="app" label="App alert" icon="notifications-outline" />
              <NotifyOption id="text" label="Text message" icon="chatbubble-ellipses-outline" />
              <NotifyOption id="both" label="Both" icon="sparkles-outline" />
            </View>
          </View>

          {canReward ? (
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: c.accent }}>
              <Ionicons name="gift" size={26} color={c.accent} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>Use your reward</Text>
                <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, marginTop: 2 }}>
                  {settings.rewardName}
                  {discountFor(true) === 0 ? ' — add a side to your order to use it' : ` · saves ${money(discountFor(true))}`}
                </Text>
              </View>
              <Switch
                value={useReward}
                disabled={discountFor(true) === 0}
                onValueChange={(v) => {
                  select();
                  setUseReward(v);
                }}
                trackColor={{ true: c.accent, false: c.surfaceHigh }}
                thumbColor="#F5F0E6"
              />
            </Card>
          ) : null}

          <Card>
            <Row label="Subtotal" value={money(totals.subtotal)} />
            {discount > 0 ? <Row label="Reward" value={`− ${money(discount)}`} valueColor={c.success} /> : null}
            <Row label={`Tax (${settings.taxRatePercent}%)`} value={money(totals.tax)} />
            <GoldDivider style={{ marginVertical: 8 }} />
            <Row label="Total" value={money(totals.total)} bold />
          </Card>

          {err ? <Banner icon="alert-circle-outline" text={err} /> : null}

          <Button
            title={payment === 'paypal' ? `Pay ${money(totals.total)} with PayPal` : `Place Order · Pay ${money(totals.total)} at pickup`}
            icon={payment === 'paypal' ? 'logo-paypal' : 'checkmark-circle-outline'}
            disabled={settings.paused}
            onPress={() => {
              if (!name.trim()) warn();
              submit();
            }}
          />
          {!user ? (
            <Body muted size={12.5} style={{ textAlign: 'center' }}>
              Guest checkout — you’ll be able to create an account after you order.
            </Body>
          ) : null}
        </View>
      </Screen>

      <PayPalSheet visible={showPay} amount={totals.total} onApprove={() => { finish(); }} onCancel={() => setShowPay(false)} />
    </KeyboardAvoidingView>
  );
}
