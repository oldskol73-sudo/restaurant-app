import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Banner, Body, Button, Card, EmptyState, Eyebrow, FadeIn, Field, FoodImage, GoldDivider, Header, Heading, Row, Screen, Stepper } from '../../components/ui';
import { OptionGroupPicker, defaultSelections } from '../../components/options';
import { success, tap, warn } from '../../lib/feedback';
import { cartTotals, findItem, lineUnitPrice, money, optionLabels } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import { fonts, radius, space, useColors } from '../../theme';

export default function Cart() {
  const c = useColors();
  const { state, updateQty, removeLine, updateLine, addToCart, clearCart } = useStore();
  const { cart, menu, settings } = state;
  const [editing, setEditing] = useState<string | null>(null);
  const totals = cartTotals(menu, cart, settings.taxRatePercent);

  const hasDrink = cart.some((l) => findItem(menu, l.itemId)?.category === 'Drinks');
  const hasDessert = cart.some((l) => findItem(menu, l.itemId)?.category === 'Desserts');
  const suggestions = !hasDrink
    ? { title: 'Add a drink?', items: menu.filter((m) => m.category === 'Drinks' && !m.soldOut && !m.isAddOn).slice(0, 4) }
    : !hasDessert
      ? { title: 'Save room for dessert?', items: menu.filter((m) => m.category === 'Desserts' && !m.soldOut).slice(0, 4) }
      : null;

  if (cart.length === 0) {
    return (
      <Screen>
        <Header title="Your Order" eyebrow="Pickup" />
        <EmptyState
          icon="bag-handle-outline"
          title="Your order is empty"
          text="Browse the menu and add something delicious. We’ll have it ready for pickup."
          action={<Button title="Browse the menu" onPress={() => router.push('/menu')} />}
        />
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen bottomPad={40}>
        <Header
          title="Your Order"
          eyebrow="Pickup"
          subtitle={`${cart.reduce((s, l) => s + l.qty, 0) === 1 ? '1 item' : cart.reduce((s, l) => s + l.qty, 0) + ' items'} · ready for you at ${settings.name}`}
          right={
            <Pressable
              onPress={() => {
                warn();
                clearCart();
              }}
              hitSlop={10}
            >
              <Text style={{ fontFamily: fonts.sansMed, color: c.muted, fontSize: 13 }}>Clear all</Text>
            </Pressable>
          }
        />
        <View style={{ paddingHorizontal: space.lg, gap: 14 }}>
          {settings.paused ? <Banner icon="pause-circle-outline" text="Online ordering is paused right now. Your items are saved — check back soon." /> : null}

          {cart.map((line, i) => {
            const item = findItem(menu, line.itemId);
            if (!item) return null;
            const { labels } = optionLabels(item, line.selections);
            const extras = line.extraIds.map((id) => findItem(menu, id)).filter(Boolean);
            const unit = lineUnitPrice(menu, line);
            const isEditing = editing === line.key;
            return (
              <FadeIn key={line.key} delay={i * 50}>
                <Card style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <FoodImage uri={item.photo} style={{ width: 74, height: 74 }} radiusValue={radius.md} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                        <Heading size={18} style={{ flex: 1 }}>
                          {item.name}
                        </Heading>
                        <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 17 }}>{money(unit * line.qty)}</Text>
                      </View>
                      {labels.length ? <Body muted size={13}>{labels.join(' · ')}</Body> : null}
                      {extras.length ? (
                        <Body muted size={13}>
                          + {extras.map((e) => e!.name).join(', ')}
                        </Body>
                      ) : null}
                      {line.note ? (
                        <Body size={13} style={{ color: c.accent, fontStyle: 'italic' }}>
                          “{line.note}”
                        </Body>
                      ) : null}
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Stepper value={line.qty} min={0} onChange={(n) => updateQty(line.key, n)} />
                    <View style={{ flexDirection: 'row', gap: 18 }}>
                      <Pressable
                        onPress={() => {
                          tap();
                          setEditing(isEditing ? null : line.key);
                        }}
                        hitSlop={8}
                        style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
                      >
                        <Ionicons name={isEditing ? 'checkmark-circle-outline' : 'create-outline'} size={17} color={c.accent} />
                        <Text style={{ color: c.accent, fontFamily: fonts.sansMed, fontSize: 13 }}>{isEditing ? 'Done' : 'Edit'}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          warn();
                          removeLine(line.key);
                        }}
                        hitSlop={8}
                        style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}
                      >
                        <Ionicons name="trash-outline" size={17} color={c.muted} />
                        <Text style={{ color: c.muted, fontFamily: fonts.sansMed, fontSize: 13 }}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>

                  {isEditing ? (
                    <View style={{ gap: 16, paddingTop: 6 }}>
                      <GoldDivider />
                      {item.optionGroupIds.map((gid) => (
                        <OptionGroupPicker
                          key={gid}
                          groupId={gid}
                          value={line.selections[gid] ?? defaultSelections(item)[gid] ?? []}
                          onChange={(v) => updateLine(line.key, { selections: { ...line.selections, [gid]: v } })}
                        />
                      ))}
                      {item.pairings.some((p) => findItem(menu, p)?.isAddOn) ? (
                        <View style={{ gap: 8 }}>
                          <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>Sauces & add-ons</Text>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {item.pairings
                              .map((p) => findItem(menu, p))
                              .filter((p): p is NonNullable<typeof p> => !!p && !!p.isAddOn)
                              .map((p) => {
                                const on = line.extraIds.includes(p.id);
                                return (
                                  <Pressable
                                    key={p.id}
                                    onPress={() => {
                                      tap();
                                      updateLine(line.key, { extraIds: on ? line.extraIds.filter((x) => x !== p.id) : [...line.extraIds, p.id] });
                                    }}
                                    style={{
                                      paddingHorizontal: 12,
                                      paddingVertical: 8,
                                      borderRadius: 999,
                                      borderWidth: 1,
                                      borderColor: on ? c.accent : c.line,
                                      backgroundColor: on ? c.accent : 'transparent',
                                    }}
                                  >
                                    <Text style={{ fontFamily: fonts.sansMed, fontSize: 12.5, color: on ? '#0A0A0A' : c.text }}>
                                      {p.name} +{money(p.price)}
                                    </Text>
                                  </Pressable>
                                );
                              })}
                          </View>
                        </View>
                      ) : null}
                      <Field label="Note for the kitchen" value={line.note} onChangeText={(t) => updateLine(line.key, { note: t })} placeholder="Any changes?" maxLength={200} />
                    </View>
                  ) : null}
                </Card>
              </FadeIn>
            );
          })}

          {suggestions && suggestions.items.length ? (
            <View style={{ marginTop: 6 }}>
              <Eyebrow>A little something extra</Eyebrow>
              <Heading size={22} style={{ marginTop: 4, marginBottom: 12 }}>
                {suggestions.title}
              </Heading>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 8 }}>
                {suggestions.items.map((m) => (
                  <Pressable
                    key={m.id}
                    onPress={() => {
                      success();
                      addToCart({ itemId: m.id, qty: 1, selections: defaultSelections(m), extraIds: [], note: '' });
                    }}
                    style={{ width: 150, backgroundColor: c.surface, borderRadius: radius.md, borderWidth: 1, borderColor: c.line, overflow: 'hidden' }}
                  >
                    <FoodImage uri={m.photo} style={{ height: 90 }} radiusValue={0} />
                    <View style={{ padding: 10, gap: 4 }}>
                      <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 13 }}>
                        {m.name}
                      </Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 13 }}>{money(m.price)}</Text>
                        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center' }}>
                          <Ionicons name="add" size={17} color="#0A0A0A" />
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <Card style={{ marginTop: 6 }}>
            <Row label="Subtotal" value={money(totals.subtotal)} />
            <Row label={`Tax (${settings.taxRatePercent}%)`} value={money(totals.tax)} />
            <GoldDivider style={{ marginVertical: 8 }} />
            <Row label="Total" value={money(totals.total)} bold />
          </Card>

          <Button title="Continue to Checkout" icon="arrow-forward" disabled={settings.paused} onPress={() => router.push('/checkout')} />
          <Button title="Add more items" variant="ghost" onPress={() => router.push('/menu')} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
