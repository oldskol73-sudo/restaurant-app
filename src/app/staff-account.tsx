import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { Banner, Body, Button, Eyebrow, FadeIn, Field, GoldDivider, Heading, Screen } from '../components/ui';
import { success } from '../lib/feedback';
import { useStore } from '../lib/store';
import { space } from '../theme';

/** One-time staff sign-in to the shared database (needed to see live orders and save menu changes for everyone). */
export default function StaffAccount() {
  const { state, backend, signInStaff, signOutStaff } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  if (!state.staffAuthed) return <Redirect href="/staff-login" />;

  const submit = async () => {
    setBusy(true);
    setErr('');
    const e = await signInStaff(email, password);
    setBusy(false);
    if (e) return setErr(e);
    success();
    router.replace('/orders');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen>
        <View style={{ padding: space.lg, gap: 18 }}>
          <FadeIn style={{ gap: 8, marginTop: 12 }}>
            <Eyebrow>Shared database</Eyebrow>
            <Heading size={32}>{backend.isDbStaff ? 'You are connected' : 'Connect this phone'}</Heading>
            <Body muted>
              {backend.isDbStaff
                ? `Signed in as ${backend.staffEmail}. Orders arrive live and menu changes are shared with every customer.`
                : 'Sign in once with the staff login (email and password) so live orders and menu changes are shared. You only do this once per phone.'}
            </Body>
          </FadeIn>
          <GoldDivider diamond />
          {backend.isDbStaff ? (
            <>
              <Button title="Go to orders" onPress={() => router.replace('/orders')} />
              <Button title="Sign this phone out of the shared database" variant="ghost" onPress={() => signOutStaff()} />
            </>
          ) : (
            <>
              <Field label="Staff email" value={email} onChangeText={setEmail} placeholder="staff@yourcafe.com" autoCapitalize="none" keyboardType="email-address" autoCorrect={false} />
              <Field label="Password" value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry autoCapitalize="none" />
              {err ? <Banner icon="alert-circle-outline" text={err} /> : null}
              <Button title="Sign in" loading={busy} onPress={submit} disabled={!email || !password} />
              <Button title="Skip for now (changes stay on this phone)" variant="ghost" onPress={() => router.replace('/orders')} />
            </>
          )}
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}
