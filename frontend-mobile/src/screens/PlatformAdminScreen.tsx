import React, { useCallback, useState } from 'react'
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { api } from '../api/client'
import { BrandBackground } from '../components/BrandBackground'
import { Badge, Card, Empty, Field, GhostButton, Loading, PrimaryButton, Screen, Title } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { colors, featureEmoji } from '../theme'
import type { AuthStackParamList } from '../navigation/types'

type Tenant = {
  id: number
  name: string
  company_code: string
  plan: string
  status: string
}

export default function PlatformAdminScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AuthStackParamList>>()
  const { isPlatform, platformLogin, logout, token } = useAuth()
  const [email, setEmail] = useState('admin@nexcrm.com')
  const [password, setPassword] = useState('admin123')
  const [busy, setBusy] = useState(false)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get<Tenant[]>('/platform/tenants')
      setTenants(data)
    } catch {
      setTenants([])
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (token && isPlatform) load()
    }, [token, isPlatform, load]),
  )

  async function onLogin() {
    setBusy(true)
    try {
      await platformLogin(email.trim(), password)
    } catch {
      Alert.alert('Sign in failed', 'Invalid platform administrator credentials.')
    } finally {
      setBusy(false)
    }
  }

  async function toggleStatus(t: Tenant) {
    const next = t.status === 'active' ? 'suspended' : 'active'
    try {
      await api.patch(`/platform/tenants/${t.id}/status`, { status: next })
      await load()
    } catch {
      Alert.alert('Update failed', 'Could not change workspace status.')
    }
  }

  if (token && isPlatform) {
    if (loading && !tenants.length) return <Loading />
    return (
      <Screen>
        <View style={styles.top}>
          <Title emoji={featureEmoji.admin} subtitle={`${tenants.length} workspaces`}>
            Platform console
          </Title>
          <Pressable onPress={() => logout()}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>
        <FlatList
          data={tenants}
          keyExtractor={(t) => String(t.id)}
          ListEmptyComponent={<Empty text="No workspaces yet" emoji="🏢" />}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <Card>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>Code · {item.company_code}</Text>
                  <Text style={styles.meta}>Plan · {item.plan}</Text>
                </View>
                <Badge text={item.status} tone={item.status === 'active' ? 'success' : 'brand'} />
              </View>
              <PrimaryButton
                label={item.status === 'active' ? 'Suspend workspace' : 'Activate workspace'}
                onPress={() => toggleStatus(item)}
                emoji={item.status === 'active' ? '⏸️' : '▶️'}
              />
            </Card>
          )}
        />
      </Screen>
    )
  }

  return (
    <BrandBackground>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Text style={styles.logo}>{featureEmoji.admin} Platform</Text>
            <Text style={styles.tag}>Administrator access to all workspaces</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.heading}>Admin sign in</Text>
            <Field label="Admin email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <PrimaryButton
              label={busy ? 'Signing in…' : 'Sign In'}
              onPress={onLogin}
              disabled={busy}
              emoji={featureEmoji.admin}
            />
            <GhostButton
              label="Back to team sign in"
              emoji={featureEmoji.login}
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BrandBackground>
  )
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  brand: { alignItems: 'center', marginBottom: 24 },
  logo: { color: colors.white, fontSize: 32, fontWeight: '800' },
  tag: { color: colors.muted, marginTop: 8, textAlign: 'center' },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 22,
  },
  heading: { color: colors.white, fontSize: 22, fontWeight: '800', marginBottom: 12 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  signOut: { color: colors.brandSoft, fontWeight: '700', marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  name: { color: colors.white, fontWeight: '800', fontSize: 17 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
})
