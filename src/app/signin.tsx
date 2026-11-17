import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Banner, Body, Button, Eyebrow, FadeIn, Field, GoldDivider, Heading, Logo, Screen } from '../components/ui';
import { success } from '../lib/feedback';
import { useStore } from '../lib/store';
import { space } from '../theme';

export default function SignIn() {
  const { state, signIn, signOut } = useStore();
  const [name, setName] = useState(state.user?.name ?? '');
  const [phone, setPhone] = useState(state.user?.phone ?? '');
  const [email, setEmail] = useState(state.user?.email ?? '');
  const [err, setErr] = useState('');

  const submit = () => {
    if (name.trim().length < 2) return setErr('Please enter your name.');
    if (phone.replace(/\D/g, '').length < 7) return setErr('Please enter a phone number so we can text you when your order is ready.');
    signIn({ name: name.trim(), phone: phone.trim(), email: email.trim() });
    success();
    if (router.canGoBack()) router.back();
    else router.replace('/menu');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ padding: space.lg, gap: 18 }}>
          <FadeIn style={{ alignItems: 'center', gap: 12, marginTop: 12 }}>
            <Logo size={76} />
            <Eyebrow>Welcome</Eyebrow>
            <Heading size={32} style={{ textAlign: 'center' }}>
              {state.user ? 'Your account' : 'Sign in or create an account'}
            </Heading>
            <Body muted style={{ textAlign: 'center' }}>
              Save favorites, reorder in one tap and earn rewards on every pickup order.
            </Body>
          </FadeIn>
          <GoldDivider diamond />
          <Field label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
          <Field label="Mobile phone" value={phone} onChangeText={setPhone} placeholder="(555) 555-5555" keyboardType="phone-pad" />
          <Field label="Email (optional)" value={email} onChangeText={setEmail} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" />
          {err ? <Banner icon="alert-circle-outline" text={err} /> : null}
          <Button title={state.user ? 'Save' : 'Continue'} onPress={submit} />
          {state.user ? (
            <Button
              title="Sign out"
              variant="ghost"
              onPress={() => {
                signOut();
                router.replace('/');
              }}
            />
          ) : null}
          <Button title="Cancel" variant="ghost" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
