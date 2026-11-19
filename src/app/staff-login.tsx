import { router } from 'expo-router';
import React from 'react';
import { PinPad } from '../components/PinPad';
import { Screen } from '../components/ui';
import { useStore } from '../lib/store';

export default function StaffLogin() {
  const { staffLogin, backend } = useStore();
  return (
    <Screen scroll={false}>
      <PinPad
        eyebrow="Restaurant staff"
        title="Enter your PIN"
        subtitle="Default PIN is 1234. Change it in Settings."
        verify={staffLogin}
        onSuccess={() => router.replace(backend.on && !backend.isDbStaff ? '/staff-account' : '/orders')}
        onCancel={() => router.back()}
      />
    </Screen>
  );
}
