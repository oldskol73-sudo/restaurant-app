import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { featuredProductIds, storeCategories, storeInfo, storeProducts } from '../../store.config';
import { Body, FadeIn, FoodImage, Heading, NavPill, PlateHero, Screen, StatBar } from '../components/ui';
import { tap } from '../lib/feedback';
import { money } from '../lib/pricing';
import { useStore } from '../lib/store';
import { fonts, radius, shadow, space, useColors } from '../theme';

export default function StoreHome() {
  const c = useColors();
  const { state } = useStore();
  const bagCount = (state.bag ?? []).reduce((s, l) => s + l.qty, 0);
  const featured = storeProducts.filter((p) => featuredProductIds.includes(p.id));

  const heroImg = featured[0]?.image ?? storeCategories[0].image;
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={['rgba(255,120,20,0.26)', 'transparent']} style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 520 }} pointerEvents="none" />
      <Screen bottomPad={bagCount ? 110 : 40}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 15, letterSpacing: 1 }}>DC</Text>
              </View>
              <View>
                <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 18 }}>{storeInfo.name}</Text>
                <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 10.5 }}>Shalom</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <NavPill label="Kitchen" icon="restaurant-outline" onPress={() => router.push('/kitchen')} />
              <NavPill label="Staff" icon="lock-closed-outline" onPress={() => router.push('/staff-login')} />
            </View>
          </View>

          <FadeIn style={{ marginTop: 30 }}>
            <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 50, lineHeight: 56 }}>Welcome to</Text>
            <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 50, lineHeight: 56 }}>the Store</Text>
            <Body style={{ marginTop: 12, maxWidth: 300 }}>{storeInfo.tagline}</Body>
            <View style={{ height: 2, width: 190, backgroundColor: c.text, marginTop: 14 }} />
          </FadeIn>

          <FadeIn delay={200} style={{ alignItems: 'center', marginTop: 26 }}>
            <PlateHero uri={heroImg} size={250} icon="ticket-outline" />
          </FadeIn>
          <View style={{ marginTop: 26 }}>
            <StatBar items={[{ label: 'Sections', value: String(storeCategories.length) }, { label: 'Kitchen', value: 'Pickup' }, { label: 'Pay', value: 'PayPal' }]} />
          </View>
        </View>

        <View style={{ padding: space.lg, gap: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 }}>
            <Heading size={28}>Shop by section</Heading>
            <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }}>
            {storeCategories.map((cat, i) => (
              <FadeIn key={cat.id} delay={i * 70} style={{ width: '48%' }}>
                <Pressable
                  onPress={() => {
                    tap();
                    router.push(cat.kind === 'kitchen' ? '/kitchen' : `/shop/${cat.id}`);
                  }}
                  style={{ borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.line, padding: 12, alignItems: 'center', gap: 10, minHeight: 200 }}
                >
                  <View style={{ width: 104, height: 104, borderRadius: 52, borderWidth: 3, borderColor: c.accent, padding: 3 }}>
                    <FoodImage uri={cat.image} style={{ flex: 1 }} radiusValue={50} icon={cat.kind === 'kitchen' ? 'restaurant-outline' : 'bag-handle-outline'} />
                  </View>
                  <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 16, textAlign: 'center', lineHeight: 20 }} numberOfLines={3}>
                    {cat.title}
                  </Text>
                  <View style={{ backgroundColor: c.accent, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, marginTop: 'auto' }}>
                    <Text style={{ fontFamily: fonts.sansSemi, fontSize: 11.5, color: '#0A0A0A' }}>{cat.kind === 'kitchen' ? 'Order now' : 'Explore'}</Text>
                  </View>
                </Pressable>
              </FadeIn>
            ))}
          </View>

          {featured.length ? (
            <View style={{ marginTop: space.md, gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Heading size={28}>Featured</Heading>
                <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
              </View>
              {featured.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    tap();
                    router.push(`/product/${p.id}`);
                  }}
                  style={{ borderRadius: radius.lg, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.line, padding: 12, flexDirection: 'row', gap: 14, alignItems: 'center' }}
                >
                  <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 3, borderColor: c.accent, padding: 3 }}>
                    <FoodImage uri={p.image} style={{ flex: 1 }} radiusValue={44} icon="ticket-outline" />
                  </View>
                  <View style={{ flex: 1, gap: 6 }}>
                    <Heading size={20}>{p.title}</Heading>
                    {p.price != null ? <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 20 }}>{money(p.price)}</Text> : null}
                    <View style={{ backgroundColor: c.accent, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start' }}>
                      <Text style={{ fontFamily: fonts.sansSemi, fontSize: 11.5, color: '#0A0A0A' }}>Buy now</Text>
                    </View>
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
              <View style={{ backgroundColor: '#0A0A0A', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.accent, fontFamily: fonts.sansSemi, fontSize: 12 }}>{bagCount}</Text>
              </View>
              <Text style={{ fontFamily: fonts.sansSemi, color: '#0A0A0A', fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase' }}>View shopping bag</Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#0A0A0A" />
          </Pressable>
        </FadeIn>
      ) : null}
    </View>
  );
}
