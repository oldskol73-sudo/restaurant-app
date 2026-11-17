import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { categories, type MenuItem } from '../../../restaurant.config';
import { Body, Button, Card, Eyebrow, FadeIn, FoodImage, GoldDivider, Heading, Screen, Tag } from '../../components/ui';
import { select } from '../../lib/feedback';
import { money } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import { fonts, radius, space, useColors } from '../../theme';

function Row({ item }: { item: MenuItem }) {
  const c = useColors();
  const { setSoldOut } = useStore();
  return (
    <Card style={{ padding: 12 }}>
      <Pressable onPress={() => router.push({ pathname: '/edit-item', params: { id: item.id } })} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <FoodImage uri={item.photo} style={{ width: 62, height: 62 }} radiusValue={radius.sm} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text numberOfLines={1} style={{ fontFamily: fonts.sansSemi, color: item.soldOut ? c.muted : c.text, fontSize: 15 }}>
            {item.name}
          </Text>
          <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 13.5 }}>{money(item.price)}</Text>
          <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>
            {item.pairings.length} linked · {item.optionGroupIds.length} option{item.optionGroupIds.length === 1 ? '' : 's'}
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end', gap: 4 }}>
          <Text style={{ fontFamily: fonts.sansMed, color: item.soldOut ? c.wine : c.muted, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' }}>
            {item.soldOut ? 'Sold out' : 'Available'}
          </Text>
          <Switch
            value={!item.soldOut}
            onValueChange={(v) => {
              select();
              setSoldOut(item.id, !v);
            }}
            trackColor={{ true: c.accent, false: c.wine }}
            thumbColor="#F5F0E6"
          />
        </View>
      </Pressable>
    </Card>
  );
}

export default function MenuManager() {
  const c = useColors();
  const {
    state: { menu },
  } = useStore();
  const meals = menu.filter((m) => !m.isAddOn);
  const addOns = menu.filter((m) => m.isAddOn);
  const soldCount = menu.filter((m) => m.soldOut).length;

  return (
    <Screen>
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, gap: 4 }}>
        <Eyebrow>Staff</Eyebrow>
        <Heading size={36} style={{ marginTop: 6 }}>
          Menu Manager
        </Heading>
        <Body muted style={{ marginTop: 4 }}>
          Flip the switch to mark a dish sold out. Tap a dish to edit its photo, price and pairings.
        </Body>
        <GoldDivider diamond style={{ marginTop: 14 }} />
      </View>

      <View style={{ padding: space.lg, gap: 14 }}>
        <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Button title="Add meal" icon="add" onPress={() => router.push({ pathname: '/edit-item', params: { new: '1' } })} />
          </View>
          <View style={{ flex: 1 }}>
            <Button title="Add extra" variant="outline" icon="add" onPress={() => router.push({ pathname: '/edit-item', params: { new: '1', addon: '1' } })} />
          </View>
        </View>
        {soldCount > 0 ? <Tag label={`${soldCount} item${soldCount === 1 ? '' : 's'} sold out`} tone="wine" /> : null}

        {categories.map((cat) => {
          const items = meals.filter((m) => m.category === cat);
          if (!items.length) return null;
          return (
            <FadeIn key={cat} style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
                <Heading size={22}>{cat}</Heading>
                <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
                <Text style={{ color: c.muted, fontFamily: fonts.sans, fontSize: 12 }}>{items.length}</Text>
              </View>
              {items.map((m) => (
                <Row key={m.id} item={m} />
              ))}
            </FadeIn>
          );
        })}

        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <Heading size={22}>Sauces & Add-ons</Heading>
            <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
          </View>
          {addOns.map((m) => (
            <Pressable key={m.id} onPress={() => router.push({ pathname: '/edit-item', params: { id: m.id } })}>
              <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }}>
                <Ionicons name="color-fill-outline" size={22} color={c.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.sansSemi, color: m.soldOut ? c.muted : c.text, fontSize: 15 }}>{m.name}</Text>
                  <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 13 }}>+{money(m.price)}</Text>
                </View>
                <AddOnSwitch item={m} />
              </Card>
            </Pressable>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function AddOnSwitch({ item }: { item: MenuItem }) {
  const c = useColors();
  const { setSoldOut } = useStore();
  return (
    <Switch
      value={!item.soldOut}
      onValueChange={(v) => {
        select();
        setSoldOut(item.id, !v);
      }}
      trackColor={{ true: c.accent, false: c.wine }}
      thumbColor="#F5F0E6"
    />
  );
}
