import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tap } from '../lib/feedback';
import { useStore } from '../lib/store';
import { fonts, radius, shadow, space, useColors } from '../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

/* ------------------------------ Animations ------------------------------- */

export function FadeIn({
  children,
  delay = 0,
  distance = 16,
  style,
}: {
  children: React.ReactNode;
  delay?: number;
  distance?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, {
      toValue: 1,
      duration: 520,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [v, delay]);
  return (
    <Animated.View
      style={[
        style,
        { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [distance, 0] }) }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* -------------------------------- Typography ----------------------------- */

export function Heading({
  children,
  size = 28,
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  size?: number;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const c = useColors();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: fonts.serif, fontSize: size, color: c.text, lineHeight: size * 1.22 }, style]}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  muted,
  size = 15,
  weight = 'sans',
  style,
  numberOfLines,
}: {
  children: React.ReactNode;
  muted?: boolean;
  size?: number;
  weight?: 'sans' | 'sansMed' | 'sansSemi';
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}) {
  const c = useColors();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: fonts[weight], fontSize: size, color: muted ? c.muted : c.text, lineHeight: size * 1.45 }, style]}
    >
      {children}
    </Text>
  );
}

export function Eyebrow({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const c = useColors();
  return (
    <Text
      style={[
        { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 2.4, textTransform: 'uppercase', color: c.accent },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function GoldDivider({ style, diamond }: { style?: StyleProp<ViewStyle>; diamond?: boolean }) {
  const c = useColors();
  if (!diamond) return <View style={[{ height: StyleSheet.hairlineWidth * 2, backgroundColor: c.line }, style]} />;
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
      <View style={{ width: 7, height: 7, backgroundColor: c.accent, transform: [{ rotate: '45deg' }] }} />
      <View style={{ flex: 1, height: 1, backgroundColor: c.line }} />
    </View>
  );
}

/* --------------------------------- Buttons -------------------------------- */

export function Button({
  title,
  onPress,
  variant = 'gold',
  icon,
  disabled,
  small,
  style,
  loading,
}: {
  title: string;
  onPress: () => void;
  variant?: 'gold' | 'outline' | 'wine' | 'ghost';
  icon?: IconName;
  disabled?: boolean;
  small?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const scale = useRef(new Animated.Value(1)).current;
  const bg = variant === 'gold' ? c.accent : variant === 'wine' ? c.wine : 'transparent';
  const fg = variant === 'gold' ? '#1C1C1E' : variant === 'wine' ? c.text : variant === 'outline' ? c.accent : c.text;
  const border = variant === 'outline' ? c.accent : 'transparent';
  return (
    <Animated.View style={[{ transform: [{ scale }], opacity: disabled ? 0.45 : 1 }, style]}>
      <Pressable
        disabled={disabled || loading}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }).start()}
        onPress={() => {
          tap();
          onPress();
        }}
        style={{
          backgroundColor: bg,
          borderColor: border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          paddingVertical: small ? 10 : 16,
          paddingHorizontal: small ? 16 : 24,
          borderRadius: radius.md,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {icon ? <Ionicons name={icon} size={small ? 16 : 19} color={fg} /> : null}
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
          style={{
            fontFamily: fonts.sansSemi,
            color: fg,
            fontSize: small ? 13 : 15,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
            flexShrink: 1,
          }}
        >
          {loading ? 'Please wait…' : title}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function IconButton({
  icon,
  onPress,
  size = 40,
  filled,
  style,
  badge,
}: {
  icon: IconName;
  onPress: () => void;
  size?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
  badge?: number;
}) {
  const c = useColors();
  return (
    <Pressable
      hitSlop={8}
      onPress={() => {
        tap();
        onPress();
      }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: filled ? c.accent : 'rgba(0,0,0,0.45)',
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={size * 0.5} color={filled ? '#1C1C1E' : c.text} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            backgroundColor: c.wine,
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 4,
          }}
        >
          <Text style={{ color: c.text, fontFamily: fonts.sansSemi, fontSize: 10 }}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon,
  style,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? c.accent : c.line,
          backgroundColor: active ? c.accent : 'transparent',
        },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={14} color={active ? '#1C1C1E' : c.accent} /> : null}
      <Text style={{ fontFamily: fonts.sansMed, fontSize: 13, color: active ? '#1C1C1E' : c.text }}>{label}</Text>
    </Pressable>
  );
}

export function Tag({ label, tone = 'wine', style }: { label: string; tone?: 'wine' | 'gold' | 'muted' | 'green'; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const bg = tone === 'wine' ? c.wine : tone === 'gold' ? c.accent : tone === 'green' ? c.success : 'rgba(255,255,255,0.12)';
  const fg = tone === 'gold' ? '#1C1C1E' : tone === 'green' ? '#10150f' : c.text;
  return (
    <View style={[{ backgroundColor: bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' }, style]}>
      <Text style={{ color: fg, fontFamily: fonts.sansSemi, fontSize: 10.5, letterSpacing: 1.1, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

/* --------------------------------- Images --------------------------------- */

export function FoodImage({
  uri,
  style,
  radiusValue = radius.lg,
  icon = 'restaurant-outline',
  transition = 400,
  showIcon = true,
}: {
  uri?: string;
  style?: StyleProp<ViewStyle>;
  radiusValue?: number;
  icon?: IconName;
  transition?: number;
  showIcon?: boolean;
}) {
  const c = useColors();
  const [failed, setFailed] = useState(false);
  const show = !!uri && !failed;
  return (
    <View style={[{ borderRadius: radiusValue, overflow: 'hidden', backgroundColor: c.surfaceHigh }, style]}>
      {show ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={transition}
          onError={() => setFailed(true)}
        />
      ) : (
        <LinearGradient
          colors={[c.surfaceHigh, c.wineSoft]}
          style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}
        >
          {showIcon ? <Ionicons name={icon} size={34} color={c.accent} /> : null}
        </LinearGradient>
      )}
    </View>
  );
}

export function Logo({ size = 110 }: { size?: number }) {
  const c = useColors();
  const {
    state: { settings },
  } = useStore();
  if (settings.logoUrl) {
    return (
      <Image
        source={{ uri: settings.logoUrl }}
        style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1.5, borderColor: c.accent }}
        contentFit="cover"
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: c.accent,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: c.accentSoft,
      }}
    >
      <View
        style={{
          width: size - 12,
          height: size - 12,
          borderRadius: (size - 12) / 2,
          borderWidth: StyleSheet.hairlineWidth * 2,
          borderColor: c.line,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: fonts.serif, fontSize: size * 0.36, color: c.accent, letterSpacing: 2 }}>
          {settings.monogram}
        </Text>
      </View>
    </View>
  );
}

/* --------------------------------- Layout --------------------------------- */

export function Screen({
  children,
  scroll = true,
  bottomPad = 32,
  noTopInset,
  contentStyle,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  bottomPad?: number;
  noTopInset?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const top = noTopInset ? 0 : insets.top;
  if (!scroll) {
    return <View style={{ flex: 1, backgroundColor: c.background, paddingTop: top }}>{children}</View>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        contentContainerStyle={[{ paddingTop: top, paddingBottom: bottomPad + insets.bottom }, contentStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
}

export function Header({
  title,
  subtitle,
  back,
  right,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
  eyebrow?: string;
}) {
  const c = useColors();
  return (
    <View style={{ paddingHorizontal: space.lg, paddingTop: space.md, paddingBottom: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 40 }}>
        {back ? (
          <Pressable
            onPress={() => {
              tap();
              if (router.canGoBack()) router.back();
              else router.replace('/menu');
            }}
            hitSlop={10}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Ionicons name="chevron-back" size={22} color={c.accent} />
            <Text style={{ fontFamily: fonts.sansMed, color: c.accent, fontSize: 14 }}>Back</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {right}
      </View>
      {eyebrow ? <Eyebrow style={{ marginTop: space.md }}>{eyebrow}</Eyebrow> : null}
      <Heading size={34} style={{ marginTop: eyebrow ? 6 : space.md }}>
        {title}
      </Heading>
      {subtitle ? (
        <Body muted style={{ marginTop: 6 }}>
          {subtitle}
        </Body>
      ) : null}
      <GoldDivider diamond style={{ marginTop: space.md }} />
    </View>
  );
}

export function Card({ children, style, onPress }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void }) {
  const c = useColors();
  const base: ViewStyle = {
    backgroundColor: c.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: c.line,
    padding: space.md,
  };
  if (onPress)
    return (
      <Pressable
        onPress={() => {
          tap();
          onPress();
        }}
        style={[base, style]}
      >
        {children}
      </Pressable>
    );
  return <View style={[base, style]}>{children}</View>;
}

export function Row({ label, value, bold, valueColor }: { label: string; value: string; bold?: boolean; valueColor?: string }) {
  const c = useColors();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 }}>
      <Text style={{ fontFamily: bold ? fonts.sansSemi : fonts.sans, color: bold ? c.text : c.muted, fontSize: bold ? 17 : 14 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: bold ? fonts.serif : fonts.sansMed, color: valueColor ?? (bold ? c.accent : c.text), fontSize: bold ? 19 : 14 }}>
        {value}
      </Text>
    </View>
  );
}

export function Stepper({ value, onChange, min = 0, max = 99 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const c = useColors();
  const btn = (icon: IconName, next: number, off: boolean) => (
    <Pressable
      disabled={off}
      hitSlop={6}
      onPress={() => {
        tap();
        onChange(next);
      }}
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        borderColor: c.line,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: off ? 0.35 : 1,
      }}
    >
      <Ionicons name={icon} size={17} color={c.accent} />
    </Pressable>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      {btn('remove', value - 1, value <= min)}
      <Text style={{ fontFamily: fonts.sansSemi, color: c.text, fontSize: 16, minWidth: 18, textAlign: 'center' }}>{value}</Text>
      {btn('add', value + 1, value >= max)}
    </View>
  );
}

export function Field({
  label,
  style,
  ...props
}: TextInputProps & { label?: string; style?: StyleProp<ViewStyle> }) {
  const c = useColors();
  const [focus, setFocus] = useState(false);
  return (
    <View style={style}>
      {label ? (
        <Text style={{ fontFamily: fonts.sansMed, color: c.muted, fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={c.muted}
        {...props}
        onFocus={(e) => {
          setFocus(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          props.onBlur?.(e);
        }}
        style={{
          fontFamily: fonts.sans,
          fontSize: 16,
          color: c.text,
          backgroundColor: c.surface,
          borderWidth: 1,
          borderColor: focus ? c.accent : c.line,
          borderRadius: radius.md,
          paddingHorizontal: 16,
          paddingVertical: 14,
          minHeight: props.multiline ? 90 : undefined,
          textAlignVertical: props.multiline ? 'top' : 'center',
        }}
      />
    </View>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: React.ReactNode }) {
  const c = useColors();
  return (
    <View style={{ alignItems: 'center', padding: space.xl, gap: 10 }}>
      <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={36} color={c.accent} />
      </View>
      <Heading size={22} style={{ textAlign: 'center', marginTop: 6 }}>
        {title}
      </Heading>
      <Body muted style={{ textAlign: 'center', maxWidth: 280 }}>
        {text}
      </Body>
      {action ? <View style={{ marginTop: 10 }}>{action}</View> : null}
    </View>
  );
}

/** Wine-red / gold notice bar */
export function Banner({ icon, text, tone = 'wine' }: { icon: IconName; text: string; tone?: 'wine' | 'gold' }) {
  const c = useColors();
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        backgroundColor: tone === 'wine' ? c.wine : c.accentSoft,
        borderRadius: radius.md,
        padding: 14,
        borderWidth: tone === 'gold' ? 1 : 0,
        borderColor: c.line,
      }}
    >
      <Ionicons name={icon} size={20} color={tone === 'wine' ? c.text : c.accent} />
      <Text style={{ flex: 1, color: c.text, fontFamily: fonts.sansMed, fontSize: 13.5, lineHeight: 19 }}>{text}</Text>
    </View>
  );
}

export function useStyles<T>(factory: (c: ReturnType<typeof useColors>) => T): T {
  const c = useColors();
  return useMemo(() => factory(c), [c]); // eslint-disable-line react-hooks/exhaustive-deps
}

export { shadow };
