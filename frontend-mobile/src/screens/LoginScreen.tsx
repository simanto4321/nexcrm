import React, { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import { BrandBackground } from '../components/BrandBackground'
import { Field, GhostButton, PrimaryButton } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { colors, featureEmoji } from '../theme'
import type { AuthStackParamList } from '../navigation/types'

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth()
  const [email, setEmail] = useState('sara@globex.com')
  const [password, setPassword] = useState('secret123')
  const [companyCode, setCompanyCode] = useState('globex')
  const [busy, setBusy] = useState(false)

  async function onSubmit() {
    setBusy(true)
    try {
      await login(email.trim(), password, companyCode.trim())
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      Alert.alert('Sign in failed', typeof detail === 'string' ? detail : 'Check email, password, and company code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BrandBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.mark}>
              <Text style={styles.markText}>N</Text>
            </View>
            <Text style={styles.logo}>NexCRM</Text>
            <Text style={styles.tag}>Premium CRM for modern sales teams</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>{featureEmoji.login} Sign in</Text>
            <Text style={styles.sub}>Welcome back — enter your workspace credentials</Text>
            <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoComplete="email" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <Field label="Company code" value={companyCode} onChangeText={setCompanyCode} autoCapitalize="none" />
            <PrimaryButton
              label={busy ? 'Signing in…' : 'Sign In'}
              onPress={onSubmit}
              disabled={busy}
              emoji={featureEmoji.login}
            />
            <GhostButton
              label="Create a workspace"
              emoji={featureEmoji.signup}
              onPress={() => navigation.navigate('Signup')}
            />
            <Pressable onPress={() => navigation.navigate('PlatformAdmin')} style={styles.adminLink}>
              <Text style={styles.adminText}>{featureEmoji.admin} Platform administrator</Text>
            </Pressable>
          </View>

          <View style={styles.features}>
            {[
              `${featureEmoji.contacts} Contacts`,
              `${featureEmoji.deals} Pipeline`,
              `${featureEmoji.telegram} Telegram`,
              `${featureEmoji.ai} AI Assistant`,
            ].map((f) => (
              <Text key={f} style={styles.featureChip}>
                {f}
              </Text>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BrandBackground>
  )
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 40 },
  brand: { alignItems: 'center', marginBottom: 28 },
  mark: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: colors.brand,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  markText: { color: colors.white, fontSize: 30, fontWeight: '800' },
  logo: { color: colors.white, fontSize: 40, fontWeight: '800', letterSpacing: -1.2 },
  tag: { color: colors.muted, marginTop: 8, fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  heading: { color: colors.white, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, marginBottom: 18, marginTop: 6, lineHeight: 20 },
  adminLink: { marginTop: 18, alignItems: 'center' },
  adminText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
  features: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 28 },
  featureChip: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
})
