import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Text, View } from 'react-native';
import { productImage, storeInfo, storeProducts } from '../../store.config';
import { Banner, Body, Button, Card, EmptyState, FadeIn, FoodImage, GoldDivider, Header, Heading, Row, Screen, Stepper } from '../components/ui';
import { money } from '../lib/pricing';
import { useStore } from '../lib/store';
import { fonts, radius, space, useColors } from '../theme';

export default function Bag() {
  const c = useColors();
  const { state, updateBagQty, clearBag } = useStore();
  const bag = state.bag ?? [];
  const lines = bag.map((l) => ({ l, p: storeProducts.find((p) => p.id === l.productId) })).filter((x) => !!x.p);
  const total = lines.reduce((s, { l, p }) => s + (p!.price ?? 0) * l.qty, 0);
  const hasUnpriced = lines.some(({ p }) => p!.price == null);

  if (lines.length === 0) {
    return (
      <Screen>
        <Header back title="Shopping Bag" eyebrow="Store" />
        <EmptyState icon="bag-handle-outline" title="Your bag is empty" text="Browse the store and add something." action={<Button title="Back to store" onPress={() => router.replace('/')} />} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Header back title="Shopping Bag" eyebrow="Store" />
      <View style={{ paddingHorizontal: space.lg, gap: 14 }}>
        {lines.map(({ l, p }, i) => (
          <FadeIn key={l.key} delay={i * 50}>
            <Card style={{ flexDirection: 'row', gap: 12 }}>
              <FoodImage uri={productImage(p!)} style={{ width: 78, height: 78 }} radiusValue={radius.md} icon="gift-outline" />
              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  <Heading size={18} style={{ flex: 1 }}>
                    {p!.title}
                  </Heading>
                  {p!.price != null ? <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 17 }}>{money(p!.price * l.qty)}</Text> : null}
                </View>
                {Object.entries(l.fields).map(([k, v]) => (
                  <Body key={k} muted size={13}>
                    {p!.fields?.find((f) => f.id === k)?.label ?? k}: {v}
                  </Body>
                ))}
                <Stepper value={l.qty} min={0} onChange={(n) => updateBagQty(l.key, n)} />
              </View>
            </Card>
          </FadeIn>
        ))}

        <Card>
          <Row label="Total" value={hasUnpriced ? `${money(total)} + amounts set on website` : money(total)} bold />
        </Card>
        <Banner tone="gold" icon="information-circle-outline" text={storeInfo.paymentNote} />
        <GoldDivider />
        {lines.map(({ p }) => (
          <Button key={p!.id} title={`Complete: ${p!.title}`} icon="open-outline" onPress={() => WebBrowser.openBrowserAsync(p!.url)} />
        ))}
        <Button title="Empty bag" variant="ghost" onPress={clearBag} />
      </View>
    </Screen>
  );
}
