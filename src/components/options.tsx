import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { optionGroups, type MenuItem } from '../../restaurant.config';
import { select } from '../lib/feedback';
import { money } from '../lib/pricing';
import { fonts, useColors } from '../theme';

export type Sel = Record<string, string[]>;

export const defaultSelections = (item: MenuItem): Sel => {
  const s: Sel = {};
  for (const gid of item.optionGroupIds) {
    const g = optionGroups.find((o) => o.id === gid);
    if (g) s[gid] = g.required ? [g.choices[0].id] : [];
  }
  return s;
};

export function OptionGroupPicker({
  groupId,
  value,
  onChange,
  compact,
}: {
  groupId: string;
  value: string[];
  onChange: (v: string[]) => void;
  compact?: boolean;
}) {
  const c = useColors();
  const g = optionGroups.find((o) => o.id === groupId);
  if (!g) return null;
  const toggle = (id: string) => {
    select();
    if (g.multiple) onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
    else onChange(value.includes(id) && !g.required ? [] : [id]);
  };
  return (
    <View style={{ gap: 10, marginTop: compact ? 8 : 0 }}>
      {!compact ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 15 }}>{g.label}</Text>
          <Text style={{ fontFamily: fonts.sans, color: c.muted, fontSize: 12 }}>{g.required ? 'Required' : 'Optional'}</Text>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {g.choices.map((ch) => {
          const on = value.includes(ch.id);
          return (
            <Pressable
              key={ch.id}
              onPress={() => toggle(ch.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: compact ? 7 : 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: on ? c.accent : c.line,
                backgroundColor: on ? c.accent : 'transparent',
              }}
            >
              <Text style={{ fontFamily: fonts.sansMed, fontSize: compact ? 12 : 13.5, color: on ? '#0A0A0A' : c.text }}>
                {ch.label}
                {ch.price ? `  +${money(ch.price)}` : ''}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

