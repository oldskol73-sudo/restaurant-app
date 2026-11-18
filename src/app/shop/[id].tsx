import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storeCategories, storeProducts } from '../../../store.config';
import { Body, Button, EmptyState, FadeIn, FoodImage, GoldDivider, Heading, IconButton } from '../../components/ui';
import { tap } from '../../lib/feedback';
import { money } from '../../lib/pricing';
import { fonts, radius, shadow, space, useColors } from '../../theme';

export default function ShopCategory() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = storeCategories.find((x) => x.id === id);
  const products = storeProducts.filter((p) => p.categoryId === id);

  if (!cat) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center' }}>
        <EmptyState icon="alert-circle-outline" title="Section not found" text="This section may have been removed." action={<Button title="Back to store" onPress={() => router.replace('/')} />} />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.background }} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
      <View>
        <FoodImage uri={cat.image} radiusValue={0} style={{ height: 260 }} icon="bag-handle-outline" />
        <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(28,28,30,1)']} locations={[0, 0.4, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
        <View style={{ position: 'absolute', top: insets.top + 10, left: 16 }}>
          <IconButton icon="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        </View>
      </View>

      <View style={{ paddingHorizontal: space.lg, marginTop: -30, gap: 14 }}>
        <FadeIn style={{ gap: 8 }}>
          <Heading size={34}>{cat.title}</Heading>
          <Body muted size={15.5} style={{ lineHeight: 24 }}>
            {cat.description}
          </Body>
        </FadeIn>
        <GoldDivider diamond />

        {products.length === 0 ? (
          <View style={{ gap: 12 }}>
            <EmptyState icon="storefront-outline" title="No items listed yet" text="Nothing is listed in this section on the website right now. You can still visit it there." />
            <Button title="Open on the website" variant="outline" icon="open-outline" onPress={() => WebBrowser.openBrowserAsync(cat.url)} />
          </View>
        ) : (
          products.map((p, i) => (
            <FadeIn key={p.id} delay={i * 80}>
              <Pressable
                onPress={() => {
                  tap();
                  router.push(`/product/${p.id}`);
                }}
                style={[{ borderRadius: radius.lg, backgroundColor: c.surface, overflow: 'hidden' }, shadow]}
              >
                <FoodImage uri={p.image} style={{ height: 190 }} radiusValue={0} icon="gift-outline" />
                <View style={{ padding: space.md, gap: 4 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                    <Heading size={21} style={{ flex: 1 }}>
                      {p.title}
                    </Heading>
                    {p.price != null ? <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 21 }}>{money(p.price)}</Text> : null}
                  </View>
                  <Body muted size={14} numberOfLines={2}>
                    {p.description}
                  </Body>
                  {p.priceNote ? <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 12.5 }}>{p.priceNote}</Text> : null}
                </View>
              </Pressable>
            </FadeIn>
          ))
        )}
        <Pressable onPress={() => WebBrowser.openBrowserAsync(cat.url)} style={{ alignSelf: 'center', padding: 8, flexDirection: 'row', gap: 6, alignItems: 'center' }}>
          <Ionicons name="open-outline" size={14} color={c.muted} />
          <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5 }}>View this section on the website</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
