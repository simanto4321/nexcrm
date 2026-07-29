import React, { useCallback, useState } from 'react'
import { Alert, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api } from '../api/client'
import { Badge, Card, Field, Loading, PrimaryButton, Screen, Title } from '../components/ui'
import { useAuth } from '../context/AuthContext'
import { colors, featureEmoji } from '../theme'

type EmailConfig = {
  team_email?: string | null
  notifications_enabled?: boolean
  smtp_configured?: boolean
}

type TelegramStatus = {
  connected: boolean
  bot_configured: boolean
  bot_username?: string | null
  chat_id?: string | null
  invite_link?: string | null
}

export default function SettingsScreen() {
  const { isAdmin, logout, tenantName, user } = useAuth()
  const [emailCfg, setEmailCfg] = useState<EmailConfig | null>(null)
  const [telegram, setTelegram] = useState<TelegramStatus | null>(null)
  const [teamEmail, setTeamEmail] = useState('')
  const [chatId, setChatId] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [msg, setMsg] = useState('')

  const load = useCallback(async () => {
    try {
      const [emailRes, tgRes] = await Promise.all([
        api.get<EmailConfig>('/email/config'),
        api.get<TelegramStatus>('/telegram/status'),
      ])
      setEmailCfg(emailRes.data)
      setTeamEmail(emailRes.data.team_email || '')
      setTelegram(tgRes.data)
      setChatId(tgRes.data.chat_id || '')
      setInviteLink(tgRes.data.invite_link || '')
      setMsg('')
    } catch {
      setMsg('Could not load checkup settings. Admin access may be required.')
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setLoading(true)
      load()
    }, [load]),
  )

  async function onRefresh() {
    setRefreshing(true)
    try {
      await load()
    } finally {
      setRefreshing(false)
    }
  }

  async function saveEmail() {
    try {
      await api.put('/email/config', { team_email: teamEmail, notifications_enabled: true })
      setMsg('✉️ Email settings saved.')
      await load()
    } catch {
      Alert.alert('Save failed', 'Could not save email settings.')
    }
  }

  async function saveTelegram() {
    try {
      await api.post('/telegram/register', { chat_id: chatId, invite_link: inviteLink || null })
      setMsg('✈️ Telegram linked successfully.')
      await load()
    } catch {
      Alert.alert('Save failed', 'Could not save Telegram settings.')
    }
  }

  async function testEmail() {
    try {
      const { data } = await api.post<{ sent: boolean; message: string }>('/email/test')
      setMsg(data.message)
    } catch {
      Alert.alert('Checkup', 'Email test could not be completed.')
    }
  }

  async function testTelegram() {
    try {
      const { data } = await api.post<{ sent: boolean; message: string }>('/telegram/test')
      setMsg(data.message)
    } catch {
      Alert.alert('Checkup', 'Telegram test could not be completed.')
    }
  }

  if (loading) return <Loading />

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.top}>
          <Title emoji={featureEmoji.settings} subtitle={`${tenantName} · ${user?.name || ''}`}>
            Setup & Checkup
          </Title>
          <Pressable onPress={() => logout()}>
            <Text style={styles.signOut}>Sign out</Text>
          </Pressable>
        </View>

        {!isAdmin ? (
          <Card>
            <Text style={styles.body}>
              {featureEmoji.admin} Ask your workspace admin to configure email and Telegram alerts.
            </Text>
          </Card>
        ) : (
          <>
            {msg ? (
              <Card style={{ borderColor: 'rgba(59,158,255,0.35)' }}>
                <Text style={styles.body}>{msg}</Text>
              </Card>
            ) : null}

            <Card>
              <View style={styles.row}>
                <Text style={styles.section}>{featureEmoji.email} Email alerts</Text>
                <Badge text={emailCfg?.smtp_configured ? 'Ready' : 'Setup needed'} tone={emailCfg?.smtp_configured ? 'success' : 'warning'} />
              </View>
              <Text style={styles.hint}>Notify your team when contacts, deals, or tasks change.</Text>
              <Field label="Team email" value={teamEmail} onChangeText={setTeamEmail} keyboardType="email-address" />
              <PrimaryButton label="Save email" onPress={saveEmail} emoji="💾" />
              <PrimaryButton label="Run email checkup" onPress={testEmail} emoji="🩺" />
            </Card>

            <Card>
              <View style={styles.row}>
                <Text style={styles.section}>{featureEmoji.telegram} Telegram</Text>
                <Badge text={telegram?.connected ? 'Linked' : 'Not linked'} tone={telegram?.connected ? 'success' : 'muted'} />
              </View>
              {telegram?.bot_configured && telegram.bot_username ? (
                <Text style={styles.ok}>Bot active · @{telegram.bot_username}</Text>
              ) : (
                <Text style={styles.hint}>Telegram bot is not ready yet. Contact your platform administrator.</Text>
              )}
              <Text style={styles.hint}>Add the bot to your group, then paste the group chat ID below.</Text>
              <Field label="Group chat ID" value={chatId} onChangeText={setChatId} />
              <Field label="Invite link (optional)" value={inviteLink} onChangeText={setInviteLink} autoCapitalize="none" />
              <PrimaryButton label="Save Telegram" onPress={saveTelegram} emoji="💾" />
              <PrimaryButton label="Run Telegram checkup" onPress={testTelegram} emoji="🩺" />
            </Card>
          </>
        )}

        <Card>
          <Text style={styles.section}>✨ Features in your workspace</Text>
          {[
            `${featureEmoji.contacts} Contacts & notes`,
            `${featureEmoji.deals} Deal pipeline`,
            `${featureEmoji.tasks} Tasks & follow-ups`,
            `${featureEmoji.alerts} Smart alerts`,
            `${featureEmoji.ai} AI assistant`,
            `${featureEmoji.telegram} Telegram notifications`,
            `${featureEmoji.email} Email notifications`,
          ].map((line) => (
            <Text key={line} style={styles.featureLine}>
              {line}
            </Text>
          ))}
        </Card>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  signOut: { color: colors.brandSoft, fontWeight: '700', marginTop: 8, fontSize: 13 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  section: { color: colors.white, fontWeight: '800', fontSize: 16 },
  hint: { color: colors.muted, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  ok: { color: colors.success, fontSize: 12, fontWeight: '700', marginBottom: 8 },
  body: { color: colors.text, lineHeight: 20 },
  featureLine: { color: colors.muted, fontSize: 14, marginTop: 8, fontWeight: '600' },
})
