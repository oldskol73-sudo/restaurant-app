import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Eyebrow, FadeIn, Heading, Screen } from '../components/ui';
import { select, success, warn } from '../lib/feedback';
import { useStore } from '../lib/store';
import { fonts, space, useColors } from '../theme';

export default function StaffLogin() {
  const c = useColors();
  const { staffLogin } = useStore();
  const [pin, setPin] = useState('');
  const [bad, setBad] = useState(false);

  const press = (d: string) => {
    select();
    setBad(false);
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) {
      if (staffLogin(next)) {
        success();
        router.replace('/orders');
      } else {
        warn();
        setBad(true);
        setTimeout(() => setPin(''), 350);
      }
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, padding: space.lg, alignItems: 'center', justifyContent: 'center', gap: 22 }}>
        <FadeIn style={{ alignItems: 'center', gap: 10 }}>
          <Ionicons name="lock-closed" size={30} color={c.accent} />
          <Eyebrow>Restaurant staff</Eyebrow>
          <Heading size={30} style={{ textAlign: 'center' }}>
            Enter your PIN
          </Heading>
          <Body muted style={{ textAlign: 'center' }}>
            Default PIN is 1234. Change it in Settings.
          </Body>
        </FadeIn>
        <View style={{ flexDirection: 'row', gap: 16, marginVertical: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: bad ? c.wine : c.accent,
                backgroundColor: i < pin.length ? (bad ? c.wine : c.accent) : 'transparent',
              }}
            />
          ))}
        </View>
        <View style={{ width: 270, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 }}>
          {keys.map((k, i) =>
            k === '' ? (
              <View key={i} style={{ width: 80, height: 64 }} />
            ) : (
              <Pressable
                key={i}
                onPress={() => (k === 'del' ? (select(), setPin(pin.slice(0, -1))) : press(k))}
                style={({ pressed }) => ({
                  width: 80,
                  height: 64,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: pressed ? c.accentSoft : c.surface,
                  borderWidth: 1,
                  borderColor: c.line,
                })}
              >
                {k === 'del' ? (
                  <Ionicons name="backspace-outline" size={22} color={c.text} />
                ) : (
                  <Text style={{ fontFamily: fonts.serif, fontSize: 26, color: c.text }}>{k}</Text>
                )}
              </Pressable>
            ),
          )}
        </View>
        <Pressable onPress={() => router.back()} style={{ padding: 10 }}>
          <Text style={{ color: c.muted, fontFamily: fonts.sansMed }}>Cancel</Text>
        </Pressable>
      </View>
    </Screen>
  );
}
