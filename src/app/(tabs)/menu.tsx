import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { categories, type MenuItem } from '../../../restaurant.config';
import { Banner, Body, Chip, EmptyState, FadeIn, FoodImage, GoldDivider, Heading, Eyebrow, Screen, Tag } from '../../components/ui';
import { select, tap } from '../../lib/feedback';
import { money } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import { fonts, radius, shadow, space, useColors } from '../../theme';

export function MenuCard({ item, index = 0 }: { item: MenuItem; index?: number }) {
  const c = useColors();
  const { state, toggleFavorite } = useStore();
  const fav = state.favorites.includes(item.id);
  return (
    <FadeIn delay={Math.min(index, 6) * 70} style={{ marginBottom: 26 }}>
      <Pressable
        onPress={() => {
          tap();
          router.push(`/meal/${item.id}`);
        }}
        style={[{ borderRadius: radius.lg, backgroundColor: c.surface }, shadow]}
      >
        <View>
          <FoodImage uri={item.photo} style={{ height: 210 }} radiusValue={radius.lg} />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.55)']}
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 90, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg }}
          />
          <View style={{ position: 'absolute', top: 12, left: 12, gap: 6 }}>
            {item.saleLabel ? <Tag label={item.saleLabel} tone="wine" /> : null}
            {item.badge ? <Tag label={item.badge} tone="gold" /> : null}
          </View>
          <Pressable
            hitSlop={10}
            onPress={() => {
              select();
              toggleFavorite(item.id);
            }}
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name={fav ? 'heart' : 'heart-outline'} size={20} color={fav ? c.accent : c.text} />
          </Pressable>
          {item.soldOut ? (
            <View
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(28,28,30,0.72)',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.lg,
              }}
            >
              <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 22, letterSpacing: 1 }}>Sold Out</Text>
            </View>
          ) : null}
        </View>
        <View style={{ padding: space.md, gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <Heading size={21} style={{ flex: 1 }}>
              {item.name}
            </Heading>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 20 }}>{money(item.price)}</Text>
              {item.wasPrice ? (
                <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12, textDecorationLine: 'line-through' }}>
                  {money(item.wasPrice)}
                </Text>
              ) : null}
            </View>
          </View>
          <Body muted size={14} numberOfLines={2}>
            {item.description}
          </Body>
        </View>
      </Pressable>
    </FadeIn>
  );
}

export default function Menu() {
  const c = useColors();
  const { state } = useStore();
  const { menu, favorites, user, cart, settings } = state;
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('All');

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    return menu.filter((m) => {
      if (m.isAddOn) return false;
      if (cat === 'Favorites' && !favorites.includes(m.id)) return false;
      if (cat !== 'All' && cat !== 'Favorites' && m.category !== cat) return false;
      if (term && !(m.name + ' ' + m.description).toLowerCase().includes(term)) return false;
      return true;
    });
  }, [menu, q, cat, favorites]);

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const sections = categories.map((name) => ({ name, items: visible.filter((m) => m.category === name) })).filter((s) => s.items.length);

  return (
    <View style={{ flex: 1 }}>
      <Screen bottomPad={cartCount ? 110 : 40}>
        <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Pressable onPress={() => router.replace('/kitchen')} hitSlop={10} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="chevron-back" size={20} color={c.accent} />
              <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 14 }}>{settings.name}</Text>
            </Pressable>
          </View>
          <Eyebrow style={{ marginTop: space.md }}>Pickup menu</Eyebrow>
          <Heading size={36} style={{ marginTop: 6 }}>
            Tonight’s Menu
          </Heading>
          <GoldDivider diamond style={{ marginTop: space.md }} />

          {settings.paused ? (
            <View style={{ marginTop: space.md }}>
              <Banner icon="pause-circle-outline" text="Online ordering is paused while the kitchen catches up. You can still browse." />
            </View>
          ) : null}

          <View
            style={{
              marginTop: space.md,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: c.surface,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: c.line,
              paddingHorizontal: 14,
            }}
          >
            <Ionicons name="search" size={18} color={c.muted} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Search dishes"
              placeholderTextColor={c.muted}
              style={{ flex: 1, paddingVertical: 14, color: c.text, fontFamily: fonts.sans, fontSize: 15 }}
              returnKeyType="search"
            />
            {q ? (
              <Pressable onPress={() => setQ('')} hitSlop={10}>
                <Ionicons name="close-circle" size={18} color={c.muted} />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 8, paddingVertical: space.md }}>
          <Chip label="All" active={cat === 'All'} onPress={() => setCat('All')} />
          {user ? <Chip label="Favorites" icon="heart" active={cat === 'Favorites'} onPress={() => setCat('Favorites')} /> : null}
          {categories.map((name) => (
            <Chip key={name} label={name} active={cat === name} onPress={() => setCat(name)} />
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: space.lg }}>
          {!user && cat === 'All' && !q ? (
            <Body muted size={12.5} style={{ marginBottom: 14 }}>
              Sign in to save Favorites with the ♡ heart.
            </Body>
          ) : null}
          {sections.length === 0 ? (
            <EmptyState
              icon={cat === 'Favorites' ? 'heart-outline' : 'search-outline'}
              title={cat === 'Favorites' ? 'No favorites yet' : 'Nothing found'}
              text={cat === 'Favorites' ? 'Tap the heart on any dish to save it here.' : 'Try a different word or category.'}
            />
          ) : (
            sections.map((s) => (
              <View key={s.name}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16, marginTop: 6 }}>
                  <Heading size={26}>{s.name}</Heading>
                  <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
                </View>
                {s.items.map((item, i) => (
                  <MenuCard key={item.id} item={item} index={i} />
                ))}
              </View>
            ))
          )}
        </View>
      </Screen>

      {cartCount > 0 ? (
        <FadeIn style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: 14 }}>
          <Pressable
            onPress={() => {
              tap();
              router.push('/cart');
            }}
            style={[
              {
                backgroundColor: c.accent,
                borderRadius: radius.md,
                paddingVertical: 15,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              },
              shadow,
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ backgroundColor: '#1C1C1E', width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: c.accent, fontFamily: fonts.sansSemi, fontSize: 12 }}>{cartCount}</Text>
              </View>
              <Text style={{ fontFamily: fonts.sansSemi, color: '#1C1C1E', fontSize: 14, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                View your order
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#1C1C1E" />
          </Pressable>
        </FadeIn>
      ) : null}
    </View>
  );
}
