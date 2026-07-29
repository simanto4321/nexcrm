import React, { useCallback, useState } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, type AppNotification } from '../api/client'
import { Badge, Card, Empty, Loading, Screen, Title } from '../components/ui'
import { colors, featureEmoji } from '../theme'

export default function NotificationsScreen() {
  const [items, setItems] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get<AppNotification[]>('/notifications')
      setItems(r.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      load().catch(() => setItems([]))
    }, [load]),
  )

  async function markRead(id: number) {
    await api.post(`/notifications/${id}/read`)
    await load()
  }

  async function markAll() {
    await api.post('/notifications/read-all')
    await load()
  }

  if (loading && !items.length) return <Loading />

  const unread = items.filter((n) => !n.is_read).length

  return (
    <Screen>
      <View style={styles.top}>
        <Title emoji={featureEmoji.alerts} subtitle={`${unread} unread`}>
          Alerts
        </Title>
        {unread > 0 ? (
          <Pressable onPress={markAll}>
            <Text style={styles.markAll}>Mark all read</Text>
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={items}
        keyExtractor={(n) => String(n.id)}
        ListEmptyComponent={<Empty text="No notifications yet" emoji={featureEmoji.alerts} />}
        renderItem={({ item }) => (
          <Card style={!item.is_read ? { borderColor: 'rgba(59,158,255,0.35)' } : undefined}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.msg}>{item.message}</Text>
                <Text style={styles.time}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
              <Badge text={item.type} tone="accent" />
            </View>
            {!item.is_read ? (
              <Pressable onPress={() => markRead(item.id)} style={{ marginTop: 10 }}>
                <Text style={styles.markAll}>Mark read</Text>
              </Pressable>
            ) : null}
          </Card>
        )}
      />
    </Screen>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  markAll: { color: colors.brandSoft, fontWeight: '600', fontSize: 13, marginTop: 8 },
  row: { flexDirection: 'row', gap: 10 },
  title: { color: colors.white, fontWeight: '700', marginBottom: 4 },
  msg: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  time: { color: colors.muted, fontSize: 11, marginTop: 6 },
})
