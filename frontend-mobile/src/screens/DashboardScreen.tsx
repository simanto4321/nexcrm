import React, { useCallback, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, type DashboardData } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Badge, Card, Empty, Loading, Screen, Title } from '../components/ui'
import { colors, featureEmoji } from '../theme'

function money(n: number) {
  return `$${Math.round(n).toLocaleString()}`
}

export default function DashboardScreen() {
  const { tenantName, user, logout } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const r = await api.get<DashboardData>('/dashboard')
    setData(r.data)
  }, [])

  useFocusEffect(
    useCallback(() => {
      load().catch(() => setData(null))
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

  if (!data) return <Loading />

  const openDeals = Object.entries(data.deals_by_stage)
    .filter(([s]) => s !== 'won' && s !== 'lost')
    .reduce((a, [, n]) => a + n, 0)

  const stats = [
    { label: `${featureEmoji.contacts} Contacts`, value: String(data.total_contacts) },
    { label: `${featureEmoji.deals} Open deals`, value: String(openDeals) },
    { label: `${featureEmoji.tasks} Tasks`, value: String(data.pending_tasks) },
    { label: `${featureEmoji.team} Team`, value: String(data.team_count ?? 0) },
  ]

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brand} />}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Title emoji={featureEmoji.home} subtitle={`${tenantName} · ${user?.name || ''}`}>
              Home
            </Title>
          </View>
          <Text style={styles.signOut} onPress={() => logout()}>
            Sign out
          </Text>
        </View>

        <View style={styles.grid}>
          {stats.map((s) => (
            <Card key={s.label} style={styles.statCard}>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
            </Card>
          ))}
        </View>

        <View style={styles.row}>
          <Card style={styles.half}>
            <Text style={styles.statLabel}>{featureEmoji.pipeline} Pipeline</Text>
            <Text style={[styles.statValue, { color: colors.accent }]}>{money(data.pipeline_value ?? 0)}</Text>
          </Card>
          <Card style={styles.half}>
            <Text style={styles.statLabel}>{featureEmoji.won} Won</Text>
            <Text style={[styles.statValue, { color: colors.success }]}>{money(data.won_value ?? 0)}</Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.section}>{featureEmoji.deals} Deals by stage</Text>
          {Object.entries(data.deals_by_stage).map(([stage, count]) => (
            <View key={stage} style={styles.stageRow}>
              <Badge text={stage} tone={stage === 'won' ? 'success' : stage === 'lost' ? 'brand' : 'accent'} />
              <Text style={styles.stageCount}>{count}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.section}>⚡ Recent activity</Text>
          {!data.recent_activity?.length ? (
            <Empty text="No recent activity yet" emoji="📭" />
          ) : (
            data.recent_activity.slice(0, 8).map((a, i) => (
              <View key={`${a.kind}-${i}`} style={styles.activity}>
                <Badge text={a.kind} tone="muted" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.actTitle} numberOfLines={1}>{a.title}</Text>
                  <Text style={styles.actDetail}>{a.detail}</Text>
                </View>
              </View>
            ))
          )}
        </Card>
        <View style={{ height: 24 }} />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  signOut: { color: colors.brandSoft, fontWeight: '600', marginTop: 8, fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  statCard: { width: '47%', flexGrow: 1 },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  statValue: { color: colors.white, fontSize: 26, fontWeight: '800', marginTop: 6 },
  section: { color: colors.white, fontWeight: '700', fontSize: 16, marginBottom: 12 },
  stageRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  stageCount: { color: colors.white, fontWeight: '700', fontSize: 18 },
  activity: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  actTitle: { color: colors.text, fontWeight: '600' },
  actDetail: { color: colors.muted, fontSize: 12, marginTop: 2 },
})
