import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Switch, Text, View } from 'react-native';
import { categories, optionGroups, type MenuItem } from '../../restaurant.config';
import { Banner, Body, Button, Card, Chip, Eyebrow, Field, FoodImage, GoldDivider, Header, Screen } from '../components/ui';
import { select, success, warn } from '../lib/feedback';
import { money, uid } from '../lib/pricing';
import { useStore } from '../lib/store';
import { fonts, radius, space, useColors } from '../theme';

export default function EditItem() {
  const c = useColors();
  const params = useLocalSearchParams<{ id?: string; new?: string; addon?: string }>();
  const { state, upsertItem, deleteItem } = useStore();
  const existing = params.id ? state.menu.find((m) => m.id === params.id) : undefined;

  const [item, setItem] = useState<MenuItem>(
    () =>
      existing ?? {
        id: uid(),
        name: '',
        description: '',
        price: 0,
        category: params.addon ? 'Sides' : categories[0],
        photo: '',
        soldOut: false,
        isAddOn: !!params.addon,
        optionGroupIds: [],
        pairings: [],
      },
  );
  const [priceText, setPriceText] = useState(existing ? String(existing.price) : '');
  const [wasText, setWasText] = useState(existing?.wasPrice ? String(existing.wasPrice) : '');
  const [err, setErr] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!state.staffAuthed) return <Redirect href="/staff-login" />;

  const patch = (p: Partial<MenuItem>) => setItem((i) => ({ ...i, ...p }));
  const isNew = !existing;

  const pickPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [16, 10] });
      if (!res.canceled && res.assets[0]?.uri) {
        patch({ photo: res.assets[0].uri });
        success();
      }
    } catch {
      setErr('Could not open your photos. You can paste a photo web address instead.');
    }
  };

  const save = () => {
    const price = parseFloat(priceText.replace(',', '.'));
    if (item.name.trim().length < 2) return setErr('Please give this item a name.');
    if (!isFinite(price) || price < 0) return setErr('Please enter a price like 12.50');
    const was = wasText ? parseFloat(wasText.replace(',', '.')) : undefined;
    upsertItem({
      ...item,
      name: item.name.trim(),
      description: item.description.trim(),
      price,
      wasPrice: was && isFinite(was) && was > price ? was : undefined,
      saleLabel: was && was > price ? item.saleLabel || 'Special' : undefined,
    });
    success();
    router.back();
  };

  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const others = state.menu.filter((m) => m.id !== item.id);
  const otherMeals = others.filter((m) => !m.isAddOn);
  const otherAddOns = others.filter((m) => m.isAddOn);

  const PairRow = ({ m }: { m: MenuItem }) => {
    const on = item.pairings.includes(m.id);
    return (
      <Pressable
        onPress={() => {
          select();
          patch({ pairings: toggle(item.pairings, m.id) });
        }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}
      >
        <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? c.accent : c.muted} />
        <Text style={{ flex: 1, fontFamily: fonts.sansMed, color: c.text, fontSize: 14.5 }}>{m.name}</Text>
        <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 13 }}>{m.isAddOn ? `+${money(m.price)}` : m.category}</Text>
      </Pressable>
    );
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <Header back title={isNew ? (item.isAddOn ? 'New Extra' : 'New Meal') : 'Edit Item'} eyebrow="Menu Manager" />
        <View style={{ paddingHorizontal: space.lg, gap: 20 }}>
          {!item.isAddOn ? (
            <View style={{ gap: 12 }}>
              <FoodImage uri={item.photo} style={{ height: 190 }} radiusValue={radius.lg} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Button title="Choose photo" icon="images-outline" variant="outline" small onPress={pickPhoto} />
                </View>
                {item.photo ? (
                  <View style={{ flex: 1 }}>
                    <Button title="Remove photo" variant="ghost" small onPress={() => patch({ photo: '' })} />
                  </View>
                ) : null}
              </View>
              <Field label="…or paste a photo web address" value={item.photo.startsWith('http') ? item.photo : ''} onChangeText={(t) => patch({ photo: t.trim() })} placeholder="https://" autoCapitalize="none" autoCorrect={false} />
            </View>
          ) : null}

          <Field label="Name" value={item.name} onChangeText={(t) => patch({ name: t })} placeholder={item.isAddOn ? 'e.g. Garlic Aioli' : 'e.g. Seared Ribeye'} />
          <Field label="Short description" value={item.description} onChangeText={(t) => patch({ description: t })} placeholder="What makes it special?" multiline />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Field style={{ flex: 1 }} label={item.isAddOn ? 'Extra price' : 'Price'} value={priceText} onChangeText={setPriceText} placeholder="0.00" keyboardType="decimal-pad" />
            {!item.isAddOn ? (
              <Field style={{ flex: 1 }} label="Old price (sale)" value={wasText} onChangeText={setWasText} placeholder="optional" keyboardType="decimal-pad" />
            ) : null}
          </View>
          {!item.isAddOn && wasText ? (
            <Field label="Sale tag text" value={item.saleLabel ?? ''} onChangeText={(t) => patch({ saleLabel: t })} placeholder="Lunch Deal" />
          ) : null}
          {!item.isAddOn ? <Field label="Small badge (optional)" value={item.badge ?? ''} onChangeText={(t) => patch({ badge: t || undefined })} placeholder="Chef’s Pick" /> : null}

          {!item.isAddOn ? (
            <View style={{ gap: 10 }}>
              <Eyebrow>Category</Eyebrow>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {categories.map((cat) => (
                  <Chip key={cat} label={cat} active={item.category === cat} onPress={() => patch({ category: cat })} />
                ))}
              </View>
            </View>
          ) : null}

          <Card style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>Sold out</Text>
              <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5 }}>Customers can’t order it while this is on</Text>
            </View>
            <Switch value={item.soldOut} onValueChange={(v) => patch({ soldOut: v })} trackColor={{ true: c.wine, false: c.surfaceHigh }} thumbColor="#F5F0E6" />
          </Card>

          {!item.isAddOn ? (
            <>
              <GoldDivider diamond />
              <View style={{ gap: 10 }}>
                <Eyebrow>Choices customers pick</Eyebrow>
                <Body muted size={13.5}>
                  Turn on the choices that apply, like size or spice level.
                </Body>
                {optionGroups.map((g) => {
                  const on = item.optionGroupIds.includes(g.id);
                  return (
                    <Pressable
                      key={g.id}
                      onPress={() => {
                        select();
                        patch({ optionGroupIds: toggle(item.optionGroupIds, g.id) });
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}
                    >
                      <Ionicons name={on ? 'checkbox' : 'square-outline'} size={22} color={on ? c.accent : c.muted} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontFamily: fonts.sansMed, color: c.text, fontSize: 14.5 }}>{g.label}</Text>
                        <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5 }}>{g.choices.map((x) => x.label).join(' · ')}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              <GoldDivider diamond />
              <View style={{ gap: 6 }}>
                <Eyebrow>“Complete the Plate” — linked sides & extras</Eyebrow>
                <Body muted size={13.5}>
                  Tick everything that pairs with this meal. These show up on its page.
                </Body>
                <Text style={{ fontFamily: fonts.sansSemi, color: c.text, marginTop: 8 }}>Meals, sides & drinks</Text>
                {otherMeals.map((m) => (
                  <PairRow key={m.id} m={m} />
                ))}
                <Text style={{ fontFamily: fonts.sansSemi, color: c.text, marginTop: 12 }}>Sauces & add-ons</Text>
                {otherAddOns.map((m) => (
                  <PairRow key={m.id} m={m} />
                ))}
              </View>
            </>
          ) : null}

          {err ? <Banner icon="alert-circle-outline" text={err} /> : null}
          <Button title={isNew ? 'Add to menu' : 'Save changes'} icon="checkmark" onPress={save} />
          {!isNew ? (
            confirmDelete ? (
              <View style={{ gap: 8 }}>
                <Banner icon="warning-outline" text={`Delete “${item.name}” for good? It will also be removed from carts and pairings.`} />
                <Button
                  title="Yes, delete it"
                  variant="wine"
                  onPress={() => {
                    warn();
                    deleteItem(item.id);
                    router.back();
                  }}
                />
                <Button title="Keep it" variant="ghost" onPress={() => setConfirmDelete(false)} />
              </View>
            ) : (
              <Button title="Delete item" variant="ghost" icon="trash-outline" onPress={() => setConfirmDelete(true)} />
            )
          ) : null}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
