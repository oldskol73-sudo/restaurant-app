import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { storeInfo, storeProducts } from '../../../store.config';
import { Banner, Body, Button, EmptyState, Eyebrow, FadeIn, Field, FoodImage, GoldDivider, Heading, IconButton, Stepper, Tag } from '../../components/ui';
import { success } from '../../lib/feedback';
import { money } from '../../lib/pricing';
import { useStore } from '../../lib/store';
import { fonts, space, useColors } from '../../theme';

export default function ProductScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = storeProducts.find((p) => p.id === id);
  const { addToBag } = useStore();
  const [qty, setQty] = useState(1);
  const [values, setValues] = useState<Record<string, string>>({});
  const [err, setErr] = useState('');
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center' }}>
        <EmptyState icon="alert-circle-outline" title="Product not found" text="This item may have been removed." action={<Button title="Back to store" onPress={() => router.replace('/')} />} />
      </View>
    );
  }

  const add = () => {
    for (const f of product.fields ?? []) {
      if (f.required && !(values[f.id] ?? '').trim()) return setErr(`Please enter: ${f.label}`);
    }
    setErr('');
    addToBag({ productId: product.id, qty, fields: values });
    success();
    setAdded(true);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}>
        <View>
          <FoodImage uri={product.image} radiusValue={0} style={{ height: 340 }} icon="gift-outline" />
          <LinearGradient colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(28,28,30,0.95)']} locations={[0, 0.4, 1]} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
          <View style={{ position: 'absolute', top: insets.top + 10, left: 16 }}>
            <IconButton icon="chevron-back" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
          </View>
        </View>

        <View style={{ paddingHorizontal: space.lg, marginTop: -40, gap: 14 }}>
          <FadeIn style={{ gap: 10 }}>
            {product.stock != null ? <Tag label={`In stock: ${product.stock} available`} tone="green" /> : null}
            <Heading size={34}>{product.title}</Heading>
            {product.price != null ? (
              <Text style={{ fontFamily: fonts.serif, color: c.accent, fontSize: 28 }}>
                {money(product.price)}
                {product.priceNote ? <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 14 }}>{'  ' + product.priceNote}</Text> : null}
              </Text>
            ) : (
              <Text style={{ fontFamily: fonts.sansMed, color: c.muted, fontSize: 14 }}>Amount chosen at checkout on the website</Text>
            )}
            <Body muted size={15.5} style={{ lineHeight: 24 }}>
              {product.description}
            </Body>
          </FadeIn>

          {product.details?.length ? (
            <View style={{ gap: 10 }}>
              <GoldDivider diamond />
              <Eyebrow>Details</Eyebrow>
              {product.details.map((d, i) => (
                <Body key={i} size={14.5} style={{ lineHeight: 22 }}>
                  {d}
                </Body>
              ))}
            </View>
          ) : null}

          {product.fields?.length ? (
            <View style={{ gap: 12 }}>
              <GoldDivider diamond />
              {product.fields.map((f) => (
                <Field key={f.id} label={f.label} placeholder={f.placeholder} value={values[f.id] ?? ''} onChangeText={(t) => setValues((v) => ({ ...v, [f.id]: t }))} />
              ))}
            </View>
          ) : null}

          {err ? <Banner icon="alert-circle-outline" text={err} /> : null}
          {added ? <Banner tone="gold" icon="checkmark-circle-outline" text="Added to your bag." /> : null}
          <Body muted size={12.5}>
            {storeInfo.paymentNote}
          </Body>
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: space.lg, paddingTop: 14, paddingBottom: insets.bottom + 14, backgroundColor: '#0A0A0A', borderTopWidth: 1, borderTopColor: c.line, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Stepper value={qty} min={1} max={product.stock ?? 20} onChange={(n) => setQty(Math.max(1, n))} />
        <View style={{ flex: 1 }}>
          {added ? <Button title="View bag" icon="bag-handle-outline" onPress={() => router.push('/bag')} /> : <Button title={product.price != null ? `Add to Bag · ${money(product.price * qty)}` : 'Add to Bag'} onPress={add} />}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
