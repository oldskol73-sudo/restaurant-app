import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as SMS from 'expo-sms';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import { Body, Button, Card, Chip, EmptyState, Eyebrow, FadeIn, GoldDivider, Heading, Screen, Tag } from '../../components/ui';
import { success, warn } from '../../lib/feedback';
import { money } from '../../lib/pricing';
import { playNewOrderChime } from '../../lib/sound';
import { useStore } from '../../lib/store';
import type { Order } from '../../lib/types';
import { fonts, radius, space, useColors } from '../../theme';

const ago = (t: number, now: number) => {
  const m = Math.max(0, Math.round((now - t) / 60000));
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.floor(m / 60)}h ${m % 60}m ago`;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

export default function StaffOrders() {
  const c = useColors();
  const { state, setStatus, addTestOrder, staffLogout, markPaid, backend } = useStore();
  const { orders, settings } = state;
  const [filter, setFilter] = useState<'active' | 'ready' | 'done'>('active');
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState('');
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  // Chime + buzz for every brand-new order that arrives while this screen is open
  useEffect(() => {
    const ids = new Set(orders.map((o) => o.id));
    if (seen.current) {
      const fresh = orders.filter((o) => !seen.current!.has(o.id) && o.status === 'received');
      if (fresh.length) {
        playNewOrderChime();
        warn();
        setToast(`New order #${fresh[0].number} — ${fresh[0].name}`);
        setTimeout(() => setToast(''), 4000);
      }
    }
    seen.current = ids;
  }, [orders]);

  const list = useMemo(() => {
    const today = startOfToday();
    const f = orders.filter((o) => {
      if (filter === 'active') return o.status === 'received' || o.status === 'preparing';
      if (filter === 'ready') return o.status === 'ready';
      return o.status === 'completed' && o.createdAt >= today;
    });
    return f.sort((a, b) => (filter === 'done' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt));
  }, [orders, filter]);

  const counts = {
    active: orders.filter((o) => o.status === 'received' || o.status === 'preparing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    done: orders.filter((o) => o.status === 'completed' && o.createdAt >= startOfToday()).length,
  };

  const sendReady = async (o: Order) => {
    setStatus(o.id, 'ready');
    success();
    const msg = `${settings.name}: Hi ${o.name.split(' ')[0]}, order #${o.number} is ready for pickup!${o.payment === 'cash' && !o.paid ? ` Please bring ${money(o.total)} for the counter.` : ''}`;
    if (o.notify !== 'app') {
      try {
        if (Platform.OS === 'web') {
          Linking.openURL(`sms:${o.phone}?body=${encodeURIComponent(msg)}`).catch(() => {});
        } else if (await SMS.isAvailableAsync()) {
          await SMS.sendSMSAsync([o.phone], msg);
        }
      } catch {
        // texting is optional; the in-app alert is already sent
      }
    }
    setToast(
      o.notify === 'text' ? `Text ready for ${o.name}` : o.notify === 'both' ? `App alert sent + text to ${o.name}` : `App alert sent to ${o.name}`,
    );
    setTimeout(() => setToast(''), 3500);
  };

  return (
    <View style={{ flex: 1 }}>
      <Screen bottomPad={40}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: settings.paused ? c.wine : c.success }} />
              <Eyebrow>{settings.paused ? 'Ordering paused' : backend.on && !backend.isDbStaff ? 'This phone only' : 'Live · taking orders'}</Eyebrow>
            </View>
            <Pressable
              onPress={() => {
                staffLogout();
                router.replace('/');
              }}
              hitSlop={10}
              style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}
            >
              <Ionicons name="log-out-outline" size={18} color={c.accent} />
              <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 13 }}>Exit staff</Text>
            </Pressable>
          </View>
          <Heading size={36} style={{ marginTop: 8 }}>
            Orders
          </Heading>
          <GoldDivider diamond style={{ marginTop: 14 }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 8, padding: space.lg, paddingBottom: space.sm }}>
          <Chip label={`Active · ${counts.active}`} active={filter === 'active'} onPress={() => setFilter('active')} />
          <Chip label={`Ready · ${counts.ready}`} active={filter === 'ready'} onPress={() => setFilter('ready')} />
          <Chip label={`Done today · ${counts.done}`} active={filter === 'done'} onPress={() => setFilter('done')} />
        </View>

        <View style={{ paddingHorizontal: space.lg, gap: 16 }}>
          {list.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title={filter === 'active' ? 'No orders right now' : filter === 'ready' ? 'Nothing waiting' : 'No finished orders yet'}
              text={filter === 'active' ? 'New orders appear here the moment customers place them, with a chime.' : 'Orders will move here as you work through them.'}
              action={filter === 'active' ? <Button title="Send a test order" variant="outline" icon="add" onPress={addTestOrder} /> : undefined}
            />
          ) : (
            list.map((o, i) => (
              <FadeIn key={o.id} delay={i * 50}>
                <Card style={{ gap: 12, borderColor: o.payment === 'cash' && !o.paid ? c.wine : c.line, borderWidth: o.payment === 'cash' && !o.paid ? 1.5 : 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View>
                      <Text style={{ fontFamily: fonts.serif, fontSize: 30, color: c.text }}>#{o.number}</Text>
                      <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>{o.name}</Text>
                      <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, marginTop: 2 }}>
                        {ago(o.createdAt, now)} · {o.phone}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <Tag label={o.status === 'received' ? 'New' : o.status === 'preparing' ? 'Preparing' : o.status === 'ready' ? 'Ready' : 'Picked up'} tone={o.status === 'received' ? 'gold' : o.status === 'completed' ? 'muted' : 'green'} />
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        {(o.notify === 'app' || o.notify === 'both') && <Ionicons name="notifications-outline" size={16} color={c.muted} />}
                        {(o.notify === 'text' || o.notify === 'both') && <Ionicons name="chatbubble-ellipses-outline" size={16} color={c.muted} />}
                      </View>
                    </View>
                  </View>

                  {o.payment === 'cash' && !o.paid ? (
                    <View style={{ backgroundColor: c.wine, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Ionicons name="cash-outline" size={20} color={c.text} />
                        <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 14, letterSpacing: 1.4, textTransform: 'uppercase' }}>Unpaid · Cash</Text>
                      </View>
                      <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 20 }}>{money(o.total)}</Text>
                    </View>
                  ) : (
                    <Tag label={o.payment === 'paypal' ? `Paid · PayPal · ${money(o.total)}` : `Paid · Cash · ${money(o.total)}`} tone="green" />
                  )}

                  <GoldDivider />
                  <View style={{ gap: 8 }}>
                    {o.lines.map((l, li) => (
                      <View key={li}>
                        <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15.5 }}>
                          {l.qty} × {l.name}
                        </Text>
                        {l.options.length ? (
                          <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 13, marginTop: 1 }}>{l.options.join(' · ')}</Text>
                        ) : null}
                        {l.extras.length ? (
                          <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 13, marginTop: 1 }}>
                            Extras: {l.extras.map((e) => e.name).join(', ')}
                          </Text>
                        ) : null}
                        {l.note ? (
                          <View style={{ backgroundColor: c.accentSoft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginTop: 4, alignSelf: 'flex-start' }}>
                            <Text style={{ fontFamily: fonts.sansMed, color: c.text, fontSize: 13 }}>📝 {l.note}</Text>
                          </View>
                        ) : null}
                      </View>
                    ))}
                  </View>

                  <View style={{ marginTop: 4 }}>
                    {o.status === 'received' ? (
                      <Button title="Start preparing" icon="flame-outline" variant="outline" onPress={() => setStatus(o.id, 'preparing')} />
                    ) : o.status === 'preparing' ? (
                      <Button title="Ready · notify customer" icon="notifications" onPress={() => sendReady(o)} />
                    ) : o.status === 'ready' ? (
                      <View style={{ gap: 10 }}>
                        {o.payment === 'cash' && !o.paid ? (
                          <Button title={`Collect ${money(o.total)} cash & hand over`} icon="cash-outline" onPress={() => { markPaid(o.id); setStatus(o.id, 'completed'); }} />
                        ) : (
                          <Button title="Picked up" icon="checkmark-done" onPress={() => setStatus(o.id, 'completed')} />
                        )}
                        <Button title="Send alert again" variant="ghost" small icon="refresh" onPress={() => sendReady(o)} />
                      </View>
                    ) : null}
                  </View>
                </Card>
              </FadeIn>
            ))
          )}
          {list.length > 0 && filter === 'active' ? (
            <Button title="Send a test order" variant="ghost" icon="add" onPress={addTestOrder} />
          ) : null}
          <Body muted size={11.5} style={{ textAlign: 'center' }}>
            {backend.isDbStaff ? 'Connected to the shared database — orders from every phone appear here.' : backend.on ? 'Not signed in to the shared database — only orders on this phone show.' : 'Demo mode: orders live on this phone only.'}
          </Body>
        </View>
      </Screen>

      {toast ? (
        <FadeIn style={{ position: 'absolute', top: 54, left: space.lg, right: space.lg }}>
          <View style={{ backgroundColor: c.surfaceHigh, borderColor: c.accent, borderWidth: 1, borderRadius: radius.md, padding: 14, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Ionicons name="notifications" size={20} color={c.accent} />
            <Text style={{ flex: 1, fontFamily: fonts.sansMed, color: c.text, fontSize: 14 }}>{toast}</Text>
          </View>
        </FadeIn>
      ) : null}
    </View>
  );
}
