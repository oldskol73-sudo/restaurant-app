import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type MenuItem } from '../../../restaurant.config';
import { Banner, Body, Button, EmptyState, Eyebrow, FadeIn, Field, FoodImage, GoldDivider, Heading, IconButton, Stepper, Tag } from '../../components/ui';
import { select, success, tap } from '../../lib/feedback';
import { findItem, money, optionLabels, round2 } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import { OptionGroupPicker, defaultSelections, type Sel } from '../../components/options';
import { fonts, radius, space, useColors } from '../../theme';

export default function MealSpotlight() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, addToCart, toggleFavorite } = useStore();
  const { menu, favorites, user, settings } = state;
  const item = findItem(menu, String(id));

  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [sel, setSel] = useState<Sel>(() => (item ? defaultSelections(item) : {}));
  const [addOns, setAddOns] = useState<string[]>([]);
  const [pairs, setPairs] = useState<Record<string, Sel>>({});

  const pairings = useMemo(
    () => (item ? item.pairings.map((pid) => findItem(menu, pid)).filter((x): x is MenuItem => !!x) : []),
    [item, menu],
  );
  const addOnItems = pairings.filter((p) => p.isAddOn);
  const sideItems = pairings.filter((p) => !p.isAddOn);

  if (!item) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center' }}>
        <EmptyState icon="alert-circle-outline" title="Dish not found" text="This dish may have been removed from the menu." action={<Button title="Back to menu" onPress={() => router.replace('/menu')} />} />
      </View>
    );
  }

  const { delta } = optionLabels(item, sel);
  const addOnTotal = addOns.reduce((s, a) => s + (findItem(menu, a)?.price ?? 0), 0);
  const pairTotal = Object.entries(pairs).reduce((s, [pid, ps]) => {
    const p = findItem(menu, pid);
    return p ? s + p.price + optionLabels(p, ps).delta : s;
  }, 0);
  const mainUnit = round2(item.price + delta + addOnTotal);
  const total = round2(mainUnit * qty + pairTotal);
  const fav = favorites.includes(item.id);
  const blocked = item.soldOut || settings.paused;

  const togglePair = (p: MenuItem) => {
    select();
    setPairs((cur) => {
      const next = { ...cur };
      if (next[p.id]) delete next[p.id];
      else next[p.id] = defaultSelections(p);
      return next;
    });
  };
  const toggleAddOn = (p: MenuItem) => {
    select();
    setAddOns((cur) => (cur.includes(p.id) ? cur.filter((x) => x !== p.id) : [...cur, p.id]));
  };

  const add = () => {
    addToCart({ itemId: item.id, qty, selections: sel, extraIds: addOns, note: note.trim() });
    for (const [pid, ps] of Object.entries(pairs)) {
      addToCart({ itemId: pid, qty: 1, selections: ps, extraIds: [], note: '' });
    }
    success();
    if (router.canGoBack()) router.back();
    else router.replace('/menu');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 + insets.bottom }} keyboardShouldPersistTaps="handled">
        <View>
          <FoodImage uri={item.photo} radiusValue={0} style={{ height: 380 }} transition={600} />
          <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(28,28,30,0.95)']} locations={[0, 0.4, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ position: 'absolute', top: insets.top + 10, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton icon="chevron-down" onPress={() => (router.canGoBack() ? router.back() : router.replace('/menu'))} />
            <IconButton
              icon={fav ? 'heart' : 'heart-outline'}
              onPress={() => {
                if (!user) {
                  router.push('/signin');
                  return;
                }
                toggleFavorite(item.id);
              }}
            />
          </View>
        </View>

        <View style={{ paddingHorizontal: space.lg, marginTop: -44 }}>
          <FadeIn style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {item.saleLabel ? <Tag label={item.saleLabel} tone="wine" /> : null}
              {item.badge ? <Tag label={item.badge} tone="gold" /> : null}
              {item.soldOut ? <Tag label="Sold out" tone="muted" /> : null}
            </View>
            <Heading size={34}>{item.name}</Heading>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
              <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 26 }}>{money(item.price)}</Text>
              {item.wasPrice ? (
                <Text style={{ fontFamily: fonts.sans, color: c.muted, textDecorationLine: 'line-through' }}>{money(item.wasPrice)}</Text>
              ) : null}
            </View>
            <Body muted size={15.5} style={{ lineHeight: 24 }}>
              {item.description}
            </Body>
          </FadeIn>

          {settings.paused ? (
            <View style={{ marginTop: 16 }}>
              <Banner icon="pause-circle-outline" text="Online ordering is paused right now." />
            </View>
          ) : null}

          {item.optionGroupIds.length > 0 ? (
            <View style={{ marginTop: space.lg, gap: 20 }}>
              <GoldDivider diamond />
              {item.optionGroupIds.map((gid) => (
                <OptionGroupPicker key={gid} groupId={gid} value={sel[gid] ?? []} onChange={(v) => setSel((s) => ({ ...s, [gid]: v }))} />
              ))}
            </View>
          ) : null}

          {pairings.length > 0 ? (
            <View style={{ marginTop: space.lg }}>
              <GoldDivider diamond />
              <Eyebrow style={{ marginTop: space.lg }}>Chef’s pairings</Eyebrow>
              <Heading size={26} style={{ marginTop: 6 }}>
                Complete the Plate
              </Heading>
              <Body muted size={14} style={{ marginTop: 4 }}>
                Tap to add sides, drinks, sauces and extras that go beautifully with this dish.
              </Body>

              {sideItems.length > 0 ? (
                <View style={{ marginTop: 16, gap: 10 }}>
                  {sideItems.map((p) => {
                    const on = !!pairs[p.id];
                    return (
                      <View key={p.id} style={{ backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: on ? c.accent : c.line, padding: 12 }}>
                        <Pressable disabled={p.soldOut} onPress={() => togglePair(p)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: p.soldOut ? 0.45 : 1 }}>
                          <FoodImage uri={p.photo} style={{ width: 62, height: 62 }} radiusValue={radius.sm} />
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>{p.name}</Text>
                            <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, marginTop: 2 }}>
                              {p.category}
                              {p.soldOut ? ' · Sold out' : ''}
                            </Text>
                          </View>
                          <Text style={{ fontFamily: fonts.sansSemi, color: c.accent, fontSize: 14 }}>{money(p.price)}</Text>
                          <View
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 15,
                              backgroundColor: on ? c.accent : 'transparent',
                              borderWidth: 1.5,
                              borderColor: c.accent,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons name={on ? 'checkmark' : 'add'} size={18} color={on ? '#1C1C1E' : c.accent} />
                          </View>
                        </Pressable>
                        {on
                          ? p.optionGroupIds.map((gid) => (
                              <OptionGroupPicker
                                key={gid}
                                compact
                                groupId={gid}
                                value={pairs[p.id]?.[gid] ?? []}
                                onChange={(v) => setPairs((cur) => ({ ...cur, [p.id]: { ...cur[p.id], [gid]: v } }))}
                              />
                            ))
                          : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}

              {addOnItems.length > 0 ? (
                <View style={{ marginTop: 20 }}>
                  <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15, marginBottom: 10 }}>Sauces & add-ons</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {addOnItems.map((p) => {
                      const on = addOns.includes(p.id);
                      return (
                        <Pressable
                          key={p.id}
                          disabled={p.soldOut}
                          onPress={() => toggleAddOn(p)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 6,
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 999,
                            borderWidth: 1,
                            borderColor: on ? c.accent : c.line,
                            backgroundColor: on ? c.accent : 'transparent',
                            opacity: p.soldOut ? 0.4 : 1,
                          }}
                        >
                          <Ionicons name={on ? 'checkmark' : 'add'} size={14} color={on ? '#1C1C1E' : c.accent} />
                          <Text style={{ fontFamily: fonts.sansMed, fontSize: 13, color: on ? '#1C1C1E' : c.text }}>
                            {p.name}  +{money(p.price)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={{ marginTop: space.lg, gap: 14 }}>
            <GoldDivider diamond />
            <Field
              label="Special note for the kitchen"
              value={note}
              onChangeText={setNote}
              placeholder="Allergies, no onions, sauce on the side…"
              multiline
              maxLength={200}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          paddingHorizontal: space.lg,
          paddingTop: 14,
          paddingBottom: insets.bottom + 14,
          backgroundColor: '#18181A',
          borderTopWidth: 1,
          borderTopColor: c.line,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Stepper value={qty} onChange={(n) => setQty(Math.max(1, n))} min={1} max={20} />
        <View style={{ flex: 1 }}>
          <Button
            title={item.soldOut ? 'Sold out' : settings.paused ? 'Ordering paused' : `Add to Order · ${money(total)}`}
            disabled={blocked}
            onPress={add}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
