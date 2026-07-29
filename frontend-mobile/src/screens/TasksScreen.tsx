import React, { useCallback, useState } from 'react'
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { api, type Task } from '../api/client'
import { Badge, Card, Empty, Field, Loading, PrimaryButton, Screen, Title } from '../components/ui'
import { colors, featureEmoji } from '../theme'

export default function TasksScreen() {
  const [items, setItems] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get<Task[]>('/tasks')
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

  async function create() {
    if (!title.trim()) return
    try {
      await api.post('/tasks', { title: title.trim(), status: 'pending' })
      setTitle('')
      setOpen(false)
      await load()
    } catch {
      Alert.alert('Failed to create task')
    }
  }

  async function toggle(task: Task) {
    const next = task.status === 'done' ? 'pending' : 'done'
    try {
      await api.put(`/tasks/${task.id}`, { status: next })
      await load()
    } catch {
      Alert.alert('Failed to update task')
    }
  }

  if (loading && !items.length) return <Loading />

  return (
    <Screen>
      <View style={styles.top}>
        <Title emoji={featureEmoji.tasks} subtitle={`${items.filter((t) => t.status === 'pending').length} pending`}>
          Tasks
        </Title>
        <Pressable style={styles.add} onPress={() => setOpen(true)}>
          <Text style={styles.addText}>+ New</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(t) => String(t.id)}
        ListEmptyComponent={<Empty text="No tasks yet" emoji={featureEmoji.tasks} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggle(item)}>
            <Card>
              <View style={styles.row}>
                <View style={[styles.check, item.status === 'done' && styles.checkOn]}>
                  {item.status === 'done' ? <Text style={{ color: colors.white }}>✓</Text> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, item.status === 'done' && styles.done]}>{item.title}</Text>
                  {item.due_date ? (
                    <Text style={styles.due}>Due {new Date(item.due_date).toLocaleDateString()}</Text>
                  ) : null}
                </View>
                <Badge text={item.status} tone={item.status === 'done' ? 'success' : 'warning'} />
              </View>
            </Card>
          </Pressable>
        )}
      />

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New task</Text>
            <Field label="Title" value={title} onChangeText={setTitle} />
            <PrimaryButton label="Save" onPress={create} />
            <Pressable onPress={() => setOpen(false)} style={{ marginTop: 12 }}>
              <Text style={{ color: colors.muted, textAlign: 'center' }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  add: { backgroundColor: colors.brand, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 6 },
  addText: { color: colors.white, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.success, borderColor: colors.success },
  title: { color: colors.white, fontWeight: '600', fontSize: 15 },
  done: { textDecorationLine: 'line-through', color: colors.muted },
  due: { color: colors.muted, fontSize: 12, marginTop: 2 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  modalTitle: { color: colors.white, fontSize: 20, fontWeight: '700', marginBottom: 12 },
})
