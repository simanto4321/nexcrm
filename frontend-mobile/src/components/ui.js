import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandBackground } from './BrandBackground';
import { colors } from '../theme';
export function Screen({
  children,
  style
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(12)).current;
  useEffect(() => {
    Animated.parallel([Animated.timing(opacity, {
      toValue: 1,
      duration: 380,
      useNativeDriver: true
    }), Animated.timing(translate, {
      toValue: 0,
      duration: 380,
      useNativeDriver: true
    })]).start();
  }, []);
  return <BrandBackground>
      <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>
        <Animated.View style={{
        flex: 1,
        opacity,
        transform: [{
          translateY: translate
        }]
      }}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </BrandBackground>;
}
export function Card({
  children,
  style
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Title({
  children,
  subtitle,
  emoji
}) {
  return <View style={{
    marginBottom: 16
  }}>
      <Text style={styles.title}>
        {emoji ? `${emoji} ` : ''}
        {children}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>;
}
export function Field({
  label,
  ...props
}) {
  return <View style={{
    marginBottom: 14
  }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor={colors.muted} style={styles.input} autoCapitalize="none" {...props} />
    </View>;
}
export function PrimaryButton({
  label,
  onPress,
  disabled,
  emoji
}) {
  return <Pressable onPress={onPress} disabled={disabled} style={({
    pressed
  }) => [styles.btn, (disabled || pressed) && {
    opacity: disabled ? 0.5 : 0.88,
    transform: [{
      scale: pressed ? 0.98 : 1
    }]
  }]}>
      <Text style={styles.btnText}>
        {emoji ? `${emoji}  ` : ''}
        {label}
      </Text>
    </Pressable>;
}
export function GhostButton({
  label,
  onPress,
  emoji
}) {
  return <Pressable onPress={onPress} style={styles.ghost}>
      <Text style={styles.ghostText}>
        {emoji ? `${emoji}  ` : ''}
        {label}
      </Text>
    </Pressable>;
}
export function Loading() {
  return <BrandBackground>
      <View style={styles.loading}>
        <ActivityIndicator color={colors.brand} size="large" />
        <Text style={[styles.subtitle, {
        marginTop: 12
      }]}>Loading NexCRM…</Text>
      </View>
    </BrandBackground>;
}
export function Empty({
  text,
  emoji = '📭'
}) {
  return <View style={{
    paddingVertical: 36,
    alignItems: 'center'
  }}>
      <Text style={{
      fontSize: 36,
      marginBottom: 8
    }}>{emoji}</Text>
      <Text style={[styles.subtitle, {
      textAlign: 'center'
    }]}>{text}</Text>
    </View>;
}
export function Badge({
  text,
  tone = 'muted'
}) {
  const map = {
    brand: {
      bg: 'rgba(228,37,39,0.22)',
      fg: colors.brandSoft
    },
    accent: {
      bg: 'rgba(59,158,255,0.22)',
      fg: colors.accent
    },
    success: {
      bg: 'rgba(34,197,94,0.22)',
      fg: colors.success
    },
    warning: {
      bg: 'rgba(245,158,11,0.22)',
      fg: colors.warning
    },
    muted: {
      bg: 'rgba(148,163,184,0.2)',
      fg: colors.muted
    }
  };
  const t = map[tone];
  return <View style={[styles.badge, {
    backgroundColor: t.bg
  }]}>
      <Text style={[styles.badgeText, {
      color: t.fg
    }]}>{text}</Text>
    </View>;
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 12
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15
  },
  btn: {
    backgroundColor: colors.brand,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.brand,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 6
    },
    elevation: 6
  },
  btnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 15
  },
  ghost: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.glass
  },
  ghostText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 14
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  }
});