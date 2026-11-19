import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { PinPad } from '../../components/PinPad';
import { Body, Card, Chip, EmptyState, Eyebrow, FadeIn, GoldDivider, Heading, Screen } from '../../components/ui';
import { money } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import { fonts, space, useColors } from '../../theme';

const MEAL_CATS = ['Entrees', 'Sandwiches'];
const dayKey = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

function Bars({ data, accent, muted, text }: { data: { label: string; value: number }[]; accent: string; muted: string; text: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 150, gap: 6 }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 6 }}>
          <Text style={{ fontFamily: fonts.sansMed, fontSize: 9.5, color: d.value ? text : 'transparent' }}>{d.value ? Math.round(d.value) : '0'}</Text>
          <View style={{ width: '100%', maxWidth: 34, height: `${Math.max(3, (d.value / max) * 78)}%`, backgroundColor: d.value ? accent : muted, opacity: d.value ? 1 : 0.35, borderRadius: 6 }} />
          <Text style={{ fontFamily: fonts.sans, fontSize: 10.5, color: muted }}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

function Ranking({ rows, color, bg }: { rows: { name: string; qty: number; revenue: number }[]; color: string; bg: string }) {
  const c = useColors();
  const max = Math.max(1, ...rows.map((r) => r.qty));
  if (!rows.length) return <Body muted size={14}>No sales in this period yet.</Body>;
  return (
    <View style={{ gap: 12 }}>
      {rows.map((r, i) => (
        <View key={r.name} style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontFamily: fonts.serif, color, fontSize: 18, width: 22 }}>{i + 1}</Text>
            <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.sansMed, color: c.text, fontSize: 14.5 }}>
              {r.name}
            </Text>
            <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 13.5 }}>{r.qty} sold</Text>
            <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, minWidth: 56, textAlign: 'right' }}>{money(r.revenue)}</Text>
          </View>
          <View style={{ height: 5, borderRadius: 3, backgroundColor: bg, marginLeft: 32 }}>
            <View style={{ height: 5, borderRadius: 3, width: `${(r.qty / max) * 100}%`, backgroundColor: color }} />
          </View>
        </View>
      ))}
    </View>
  );
}

export default function Sales() {
  const c = useColors();
  const {
    state: { orders, settings },
  } = useStore();
  const [unlocked, setUnlocked] = useState(false);
  // Lock again whenever the manager leaves this tab
  useFocusEffect(useCallback(() => () => setUnlocked(false), []));
  const [range, setRange] = useState<'today' | 'week'>('today');

  const data = useMemo(() => {
    const now = new Date();
    const todayKey = dayKey(now.getTime());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const inRange = orders.filter((o) => (range === 'today' ? dayKey(o.createdAt) === todayKey : o.createdAt >= weekStart.getTime()));

    const totalSales = inRange.reduce((s, o) => s + o.total, 0);
    const paypal = inRange.filter((o) => o.payment === 'paypal').reduce((s, o) => s + o.total, 0);
    const cash = totalSales - paypal;

    // chart
    let bars: { label: string; value: number }[] = [];
    if (range === 'week') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const k = dayKey(d.getTime());
        bars.push({
          label: i === 0 ? 'Today' : d.toLocaleDateString(undefined, { weekday: 'short' }),
          value: inRange.filter((o) => dayKey(o.createdAt) === k).reduce((s, o) => s + o.total, 0),
        });
      }
    } else {
      const blocks: [number, number, string][] = [
        [10, 12, '10a'],
        [12, 14, '12p'],
        [14, 16, '2p'],
        [16, 18, '4p'],
        [18, 20, '6p'],
        [20, 22, '8p'],
        [22, 24, '10p'],
      ];
      bars = blocks.map(([a, b, label]) => ({
        label,
        value: inRange.filter((o) => new Date(o.createdAt).getHours() >= a && new Date(o.createdAt).getHours() < b).reduce((s, o) => s + o.total, 0),
      }));
    }

    const meals = new Map<string, { qty: number; revenue: number }>();
    const addons = new Map<string, { qty: number; revenue: number }>();
    const bump = (m: Map<string, { qty: number; revenue: number }>, name: string, qty: number, revenue: number) => {
      const cur = m.get(name) ?? { qty: 0, revenue: 0 };
      m.set(name, { qty: cur.qty + qty, revenue: cur.revenue + revenue });
    };
    for (const o of inRange) {
      for (const l of o.lines) {
        const extrasCost = l.extras.reduce((s, e) => s + e.price, 0);
        bump(MEAL_CATS.includes(l.category) ? meals : addons, l.name, l.qty, (l.unitPrice - extrasCost) * l.qty);
        for (const e of l.extras) bump(addons, e.name, l.qty, e.price * l.qty);
      }
    }
    const rank = (m: Map<string, { qty: number; revenue: number }>) =>
      [...m.entries()]
        .map(([name, v]) => ({ name, ...v }))
        .sort((a, b) => b.qty - a.qty || b.revenue - a.revenue)
        .slice(0, 5);

    return {
      count: inRange.length,
      totalSales,
      avg: inRange.length ? totalSales / inRange.length : 0,
      paypal,
      cash,
      bars,
      meals: rank(meals),
      addons: rank(addons),
    };
  }, [orders, range]);

  if (!unlocked) {
    return (
      <Screen scroll={false}>
        <PinPad
          eyebrow="Sales"
          title="Sales passcode"
          subtitle="Enter the sales passcode to see reports."
          verify={(pin) => pin === settings.salesPin}
          onSuccess={() => setUnlocked(true)}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, gap: 4 }}>
        <Eyebrow>Staff</Eyebrow>
        <Heading size={36} style={{ marginTop: 6 }}>
          Sales Summary
        </Heading>
        <GoldDivider diamond style={{ marginTop: 14 }} />
      </View>

      <View style={{ padding: space.lg, gap: 18 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label="Today" active={range === 'today'} onPress={() => setRange('today')} />
          <Chip label="This week" active={range === 'week'} onPress={() => setRange('week')} />
        </View>

        {data.count === 0 && range === 'today' ? (
          <Card>
            <EmptyState icon="cafe-outline" title="No orders yet today" text="Today’s numbers will fill in as orders come through. Check “This week” for the full picture." />
          </Card>
        ) : null}

        <FadeIn key={range}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Card style={{ flex: 1.3, gap: 4 }}>
              <Eyebrow>Total sales</Eyebrow>
              <Text style={{ fontFamily: fonts.serif, fontSize: 32, color: c.accent }}>{money(data.totalSales)}</Text>
              <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>incl. tax</Text>
            </Card>
            <Card style={{ flex: 1, gap: 4 }}>
              <Eyebrow>Orders</Eyebrow>
              <Text style={{ fontFamily: fonts.serif, fontSize: 32, color: c.text }}>{data.count}</Text>
              <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>avg {money(data.avg)}</Text>
            </Card>
          </View>
        </FadeIn>

        <Card style={{ gap: 14 }}>
          <Heading size={20}>{range === 'week' ? 'Sales by day' : 'Sales by time of day'}</Heading>
          <Bars data={data.bars} accent={c.accent} muted={c.muted} text={c.text} />
        </Card>

        <Card style={{ gap: 12 }}>
          <Heading size={20}>How customers paid</Heading>
          <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: c.surfaceHigh }}>
            <View style={{ flex: data.paypal || 0.0001, backgroundColor: c.accent }} />
            <View style={{ flex: data.cash || 0.0001, backgroundColor: c.wine }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontFamily: fonts.sansMed, color: c.text, fontSize: 13.5 }}>
              <Text style={{ color: c.accent }}>● </Text>PayPal {money(data.paypal)}
            </Text>
            <Text style={{ fontFamily: fonts.sansMed, color: c.text, fontSize: 13.5 }}>
              <Text style={{ color: c.wine }}>● </Text>Cash {money(data.cash)}
            </Text>
          </View>
        </Card>

        <Card style={{ gap: 14 }}>
          <Heading size={20}>Best-selling meals</Heading>
          <Ranking rows={data.meals} color={c.accent} bg={c.surfaceHigh} />
        </Card>

        <Card style={{ gap: 14 }}>
          <Heading size={20}>Best-selling add-ons</Heading>
          <Body muted size={12.5} style={{ marginTop: -8 }}>
            Sides, drinks, desserts, sauces & extras
          </Body>
          <Ranking rows={data.addons} color={c.accent} bg={c.surfaceHigh} />
        </Card>
      </View>
    </Screen>
  );
}
