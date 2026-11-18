import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { featuredProductIds, storeCategories, storeInfo, storeProducts } from '../../store.config';
import { Eyebrow, FadeIn, FoodImage, GoldDivider, Heading, Screen, Tag } from '../components/ui';
import { tap } from '../lib/feedback';
import { money } from '../lib/pricing';
import { useStore } from '../lib/store';
import { fonts, radius, shadow, space, useColors } from '../theme';

export default function StoreHome() {
  const c = useColors();
  const { state } = useStore();
  const bagCount = (state.bag ?? []).reduce((s, l) => s + l.qty, 0);
  const featured = storeProducts.filter((p) => featuredProductIds.includes(p.id));

  return (
    <View style={{ flex: 1 }}>
      <Screen bottomPad={bagCount ? 110 : 40}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: c.accent, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 17, letterSpacing: 1 }}>DC</Text>
              </View>
              <View>
                <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 20 }}>{storeInfo.name}</Text>
                <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>Shalom</Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                tap();
                router.push('/staff-login');
              }}
              hitSlop={10}
              style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}
            >
              <Ionicons name="lock-closed-outline" size={13} color={c.muted} />
              <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>Staff</Text>
            </Pressable>
          </View>

          <FadeIn style={{ marginTop: space.lg }}>
            <Eyebrow>{storeInfo.tagline}</Eyebrow>
            <Heading size={40} style={{ marginTop: 6 }}>
              Welcome to the Store
            </Heading>
          </FadeIn>
          <GoldDivider diamond style={{ marginTop: space.md }} />
        </View>

        <View style={{ padding: space.lg, gap: 14 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }}>
            {storeCategories.map((cat, i) => (
              <FadeIn key={cat.id} delay={i * 70} style={{ width: '48%' }}>
                <Pressable
                  onPress={() => {
                    tap();
                    router.push(cat.kind === 'kitchen' ? '/kitchen' : `/shop/${cat.id}`);
                  }}
                  style={[{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: c.surface, borderWidth: 1, borderColor: c.line }, shadow]}
                >
                  <FoodImage uri={cat.image} style={{ height: 150 }} radiusValue={0} icon={cat.kind === 'kitchen' ? 'restaurant-outline' : 'bag-handle-outline'} />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={{ position: 'absolute', left: 0, right: 0, top: 70, height: 80 }} />
                  {cat.kind === 'kitchen' ? (
                    <View style={{ position: 'absolute', top: 10, left: 10 }}>
                      <Tag label="Order pickup" tone="gold" />
                    </View>
                  ) : null}
                  <View style={{ padding: 12, minHeight: 64, justifyContent: 'center' }}>
                    <Text style={{ fontFamily: fonts.serifSemi, color: c.text, fontSize: 15.5, lineHeight: 20 }} numberOfLines={3}>
                      {cat.title}
                    </Text>
                  </View>
                </Pressable>
              </FadeIn>
            ))}
          </View>

          {featured.length ? (
            <View style={{ marginTop: space.md, gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Heading size={26}>Featured Products</Heading>
                <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
              </View>
              {featured.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    tap();
                    router.push(`/product/${p.id}`);
                  }}
                  style={[{ borderRadius: radius.lg, backgroundColor: c.surface, overflow: 'hidden' }, shadow]}
                >
                  <FoodImage uri={p.image} style={{ height: 210 }} radiusValue={0} icon="ticket-outline" />
                  <View style={{ padding: space.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <Heading size={21} style={{ flex: 1 }}>
                      {p.title}
                    </Heading>
                    {p.price != null ? <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 21 }}>{money(p.price)}</Text> : null}
                  </View>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
      </Screen>

      {bagCount > 0 ? (
        <FadeIn style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: 16 }}>
          <Pressable
            onPress={() => {
              tap();
              router.push('/bag');
            }}
            style={[{ backgroundColor: c.accent, borderRadius: radius.md, paddingVertical: 15, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, shadow]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ backgroundColor: '#1C1C1E', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.accent, fontFamily: fonts.sansSemi, fontSize: 12 }}>{bagCount}</Text>
              </View>
              <Text style={{ fontFamily: fonts.sansSemi, color: '#1C1C1E', fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase' }}>View shopping bag</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#1C1C1E" />
          </Pressable>
        </FadeIn>
      ) : null}
    </View>
  );
}
