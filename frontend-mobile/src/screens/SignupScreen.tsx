import React, { useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
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

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>

export default function SignupScreen({ navigation }: Props) {
  const { signup } = useAuth()
  const [form, setForm] = useState({
    tenant_name: '',
    company_code: '',
    admin_name: '',
    admin_email: '',
    password: '',
  })
  const [busy, setBusy] = useState(false)

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function onSubmit() {
    if (!form.tenant_name.trim() || !form.company_code.trim() || !form.admin_email.trim() || !form.password) {
      Alert.alert('Missing fields', 'Please fill in all required fields.')
      return
    }
    setBusy(true)
    try {
      await signup({
        tenant_name: form.tenant_name.trim(),
        company_code: form.company_code.trim().toLowerCase(),
        admin_name: form.admin_name.trim() || 'Admin',
        admin_email: form.admin_email.trim(),
        password: form.password,
      })
    } catch (e: unknown) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      Alert.alert('Sign up failed', typeof detail === 'string' ? detail : 'Could not create workspace.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BrandBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.logo}>NexCRM</Text>
            <Text style={styles.tag}>{featureEmoji.signup} Launch your sales workspace</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Create account</Text>
            <Text style={styles.sub}>Set up your company and admin profile</Text>
            <Field label="Company name" value={form.tenant_name} onChangeText={(v) => set('tenant_name', v)} autoCapitalize="words" />
            <Field label="Company code" value={form.company_code} onChangeText={(v) => set('company_code', v)} autoCapitalize="none" />
            <Field label="Your name" value={form.admin_name} onChangeText={(v) => set('admin_name', v)} autoCapitalize="words" />
            <Field label="Admin email" value={form.admin_email} onChangeText={(v) => set('admin_email', v)} keyboardType="email-address" />
            <Field label="Password" value={form.password} onChangeText={(v) => set('password', v)} secureTextEntry />
            <PrimaryButton
              label={busy ? 'Creating…' : 'Get started'}
              onPress={onSubmit}
              disabled={busy}
              emoji={featureEmoji.signup}
            />
            <GhostButton label="Already have an account? Sign in" emoji={featureEmoji.login} onPress={() => navigation.navigate('Login')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BrandBackground>
  )
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 36 },
  brand: { alignItems: 'center', marginBottom: 22 },
  logo: { color: colors.white, fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  tag: { color: colors.muted, marginTop: 8, fontSize: 14 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  heading: { color: colors.white, fontSize: 22, fontWeight: '800' },
  sub: { color: colors.muted, marginBottom: 16, marginTop: 6 },
})
