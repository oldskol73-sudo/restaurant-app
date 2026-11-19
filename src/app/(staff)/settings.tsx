import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { Banner, Body, Button, Card, Eyebrow, Field, GoldDivider, Heading, Logo, Screen, Stepper } from '../../components/ui';
import { select, success, warn } from '../../lib/feedback';
import { fmtTime } from '../../lib/hours';
import { defaultSettings, useStore } from '../../lib/store';
import { fonts, radius, space, useColors } from '../../theme';

const ACCENTS = [
  { name: 'Orange', hex: '#FF9F1C' },
  { name: 'Gold', hex: '#C9A227' },
  { name: 'Copper', hex: '#C47A4A' },
  { name: 'Emerald', hex: '#3FA37A' },
  { name: 'Sapphire', hex: '#5B8DEF' },
  { name: 'Rose', hex: '#D77A8C' },
  { name: 'Platinum', hex: '#BFC3C9' },
];
const WINES = [
  { name: 'Brick', hex: '#C2362B' },
  { name: 'Wine', hex: '#7A1F2B' },
  { name: 'Crimson', hex: '#A3262F' },
  { name: 'Plum', hex: '#5E2750' },
  { name: 'Forest', hex: '#2E5A3F' },
  { name: 'Navy', hex: '#26407A' },
];

const shift = (t: string, mins: number) => {
  const [h, m] = t.split(':').map(Number);
  let total = (h * 60 + m + mins + 1440) % 1440;
  if (total < 0) total += 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

function TimeStepper({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const c = useColors();
  const b = (icon: 'remove' | 'add', d: number) => (
    <Pressable
      hitSlop={6}
      onPress={() => {
        select();
        onChange(shift(value, d));
      }}
      style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={icon} size={15} color={c.accent} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {b('remove', -30)}
      <Text style={{ fontFamily: fonts.sansMed, color: c.text, fontSize: 13.5, minWidth: 62, textAlign: 'center' }}>{fmtTime(value)}</Text>
      {b('add', 30)}
    </View>
  );
}

function Section({ title, children, eyebrow }: { title: string; children: React.ReactNode; eyebrow?: string }) {
  return (
    <View style={{ gap: 14 }}>
      <View>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading size={24} style={{ marginTop: 4 }}>
          {title}
        </Heading>
      </View>
      {children}
    </View>
  );
}

export default function Settings() {
  const c = useColors();
  const { state, updateSettings, resetAll, staffLogout, backend } = useStore();
  const { settings } = state;
  const [taxText, setTaxText] = useState(String(settings.taxRatePercent));
  const [confirmReset, setConfirmReset] = useState(false);
  const [pinText, setPinText] = useState(settings.staffPin);
  const [salesPinText, setSalesPinText] = useState(settings.salesPin);

  const Swatches = ({ list, value, onPick }: { list: { name: string; hex: string }[]; value: string; onPick: (hex: string) => void }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {list.map((s) => {
        const on = s.hex.toLowerCase() === value.toLowerCase();
        return (
          <Pressable
            key={s.hex}
            onPress={() => {
              select();
              onPick(s.hex);
            }}
            style={{ alignItems: 'center', gap: 6 }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: s.hex,
                borderWidth: on ? 3 : 1,
                borderColor: on ? c.text : c.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {on ? <Ionicons name="checkmark" size={20} color="#0A0A0A" /> : null}
            </View>
            <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 11 }}>{s.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <Screen>
      <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
        <Eyebrow>Staff</Eyebrow>
        <Heading size={36} style={{ marginTop: 6 }}>
          Restaurant Settings
        </Heading>
        <GoldDivider diamond style={{ marginTop: 14 }} />
      </View>

      <View style={{ padding: space.lg, gap: 30 }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderColor: settings.paused ? c.wine : c.line, borderWidth: settings.paused ? 1.5 : 1 }}>
          <Ionicons name={settings.paused ? 'pause-circle' : 'play-circle'} size={34} color={settings.paused ? c.wine : c.success} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.serifSemi, fontSize: 18, color: c.text }}>{settings.paused ? 'Online ordering is PAUSED' : 'Taking online orders'}</Text>
            <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, marginTop: 2 }}>
              {settings.paused ? 'Customers can browse but can’t order.' : 'Switch off when the kitchen is slammed.'}
            </Text>
          </View>
          <Switch
            value={!settings.paused}
            onValueChange={(v) => {
              warn();
              updateSettings({ paused: !v });
            }}
            trackColor={{ true: c.accent, false: c.wine }}
            thumbColor="#F5F0E6"
          />
        </Card>

        {backend.on ? (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Ionicons name={backend.isDbStaff ? 'cloud-done' : 'cloud-offline'} size={28} color={backend.isDbStaff ? c.success : c.muted} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>{backend.isDbStaff ? 'Shared database connected' : 'Not connected to the shared database'}</Text>
              <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12.5, marginTop: 2 }}>
                {backend.isDbStaff ? backend.staffEmail : 'Changes here stay on this phone until you sign in.'}
              </Text>
            </View>
            <Pressable onPress={() => router.push('/staff-account')} hitSlop={8}>
              <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 13 }}>{backend.isDbStaff ? 'Manage' : 'Sign in'}</Text>
            </Pressable>
          </Card>
        ) : null}

        <Section title="Name & logo" eyebrow="Brand">
          <View style={{ alignItems: 'center' }}>
            <Logo size={86} />
          </View>
          <Field label="Restaurant name" value={settings.name} onChangeText={(t) => updateSettings({ name: t })} />
          <Field label="Tagline" value={settings.tagline} onChangeText={(t) => updateSettings({ tagline: t })} />
          <Field label="Logo letters (2–3)" value={settings.monogram} maxLength={3} autoCapitalize="characters" onChangeText={(t) => updateSettings({ monogram: t.toUpperCase() })} />
          <Field label="…or logo picture web address" value={settings.logoUrl} onChangeText={(t) => updateSettings({ logoUrl: t.trim() })} placeholder="https://" autoCapitalize="none" autoCorrect={false} />
        </Section>

        <Section title="Colors" eyebrow="Look & feel">
          <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 14 }}>Accent (buttons, prices, lines)</Text>
          <Swatches list={ACCENTS} value={settings.accent} onPick={(hex) => updateSettings({ accent: hex })} />
          <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 14, marginTop: 6 }}>Highlight (sale tags, unpaid)</Text>
          <Swatches list={WINES} value={settings.wine} onPick={(hex) => updateSettings({ wine: hex })} />
        </Section>

        <Section title="Address & phone" eyebrow="Find us">
          <Field label="Address" value={settings.address} onChangeText={(t) => updateSettings({ address: t })} multiline />
          <Field label="Phone" value={settings.phone} onChangeText={(t) => updateSettings({ phone: t })} keyboardType="phone-pad" />
        </Section>

        <Section title="Hours" eyebrow="Open for pickup">
          <Card style={{ gap: 4, paddingVertical: 8 }}>
            {settings.hours.map((h, i) => (
              <View key={h.day}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, gap: 8 }}>
                  <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 14, width: 84 }}>{h.day.slice(0, 3)}</Text>
                  {h.closed ? (
                    <Text style={{ flex: 1, fontFamily: fonts.sans, color: c.muted, fontSize: 13.5 }}>Closed</Text>
                  ) : (
                    <View style={{ flex: 1, gap: 6 }}>
                      <TimeStepper value={h.open} onChange={(v) => updateSettings({ hours: settings.hours.map((x, xi) => (xi === i ? { ...x, open: v } : x)) })} />
                      <TimeStepper value={h.close} onChange={(v) => updateSettings({ hours: settings.hours.map((x, xi) => (xi === i ? { ...x, close: v } : x)) })} />
                    </View>
                  )}
                  <Switch
                    value={!h.closed}
                    onValueChange={(v) => updateSettings({ hours: settings.hours.map((x, xi) => (xi === i ? { ...x, closed: !v } : x)) })}
                    trackColor={{ true: c.accent, false: c.surfaceHigh }}
                    thumbColor="#F5F0E6"
                  />
                </View>
                {i < settings.hours.length - 1 ? <GoldDivider /> : null}
              </View>
            ))}
          </Card>
        </Section>

        <Section title="Sales tax" eyebrow="Pricing">
          <Field
            label="Tax rate (%)"
            value={taxText}
            keyboardType="decimal-pad"
            onChangeText={(t) => {
              setTaxText(t);
              const n = parseFloat(t.replace(',', '.'));
              if (isFinite(n) && n >= 0 && n < 40) updateSettings({ taxRatePercent: n });
            }}
          />
        </Section>

        <Section title="Rewards" eyebrow="Loyalty">
          <Card style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>Rewards program</Text>
              <Switch value={settings.rewardsEnabled} onValueChange={(v) => updateSettings({ rewardsEnabled: v })} trackColor={{ true: c.accent, false: c.surfaceHigh }} thumbColor="#F5F0E6" />
            </View>
            {settings.rewardsEnabled ? (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.sans, color: c.text, fontSize: 14, flex: 1 }}>Orders for one reward</Text>
                  <Stepper value={settings.ordersPerReward} min={2} max={20} onChange={(n) => updateSettings({ ordersPerReward: n })} />
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.sans, color: c.text, fontSize: 14, flex: 1 }}>Points per $1 spent</Text>
                  <Stepper value={settings.pointsPerDollar} min={1} max={50} onChange={(n) => updateSettings({ pointsPerDollar: n })} />
                </View>
                <Field label="Reward name" value={settings.rewardName} onChangeText={(t) => updateSettings({ rewardName: t })} />
                <Body muted size={12.5}>
                  The reward takes the price of the cheapest side off a customer’s order.
                </Body>
              </>
            ) : null}
          </Card>
        </Section>

        <Section title="PIN codes" eyebrow="Security">
          <Field
            label="Staff PIN (opens the staff screens)"
            value={pinText}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            onChangeText={(t) => {
              const d = t.replace(/\D/g, '').slice(0, 4);
              setPinText(d);
              if (d.length === 4) {
                updateSettings({ staffPin: d });
                success();
              }
            }}
          />
          <Field
            label="Sales tab passcode"
            value={salesPinText}
            keyboardType="number-pad"
            maxLength={4}
            secureTextEntry
            onChangeText={(t) => {
              const d = t.replace(/\D/g, '').slice(0, 4);
              setSalesPinText(d);
              if (d.length === 4) {
                updateSettings({ salesPin: d });
                success();
              }
            }}
          />
          {pinText.length < 4 || salesPinText.length < 4 ? <Banner tone="gold" icon="information-circle-outline" text="Type all 4 digits to change a PIN." /> : null}
        </Section>

        <Section title="Demo data" eyebrow="Housekeeping">
          {confirmReset ? (
            <View style={{ gap: 8 }}>
              <Banner icon="warning-outline" text="This puts the menu, settings and sample sales back to how they started and clears your cart and orders." />
              <Button
                title="Yes, reset everything"
                variant="wine"
                onPress={() => {
                  warn();
                  resetAll();
                  setConfirmReset(false);
                  setTaxText(String(defaultSettings().taxRatePercent));
                  setPinText(defaultSettings().staffPin);
                setSalesPinText(defaultSettings().salesPin);
                }}
              />
              <Button title="Cancel" variant="ghost" onPress={() => setConfirmReset(false)} />
            </View>
          ) : (
            <Button title="Reset to defaults" variant="outline" icon="refresh" onPress={() => setConfirmReset(true)} />
          )}
        </Section>

        <Button
          title="Exit staff mode"
          variant="ghost"
          icon="log-out-outline"
          onPress={() => {
            staffLogout();
            router.replace('/');
          }}
        />
      </View>
    </Screen>
  );
}
