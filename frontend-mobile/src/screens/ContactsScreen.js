import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { Badge, Card, Empty, Field, Loading, PrimaryButton, Screen, Title } from '../components/ui';
import { colors, featureEmoji } from '../theme';
export default function ContactsScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'lead',
    notes: ''
  });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/contacts');
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    load().catch(() => setItems([]));
  }, [load]));
  async function create() {
    if (!form.name.trim()) {
      Alert.alert('Name required');
      return;
    }
    try {
      await api.post('/contacts', form);
      setOpen(false);
      setForm({
        name: '',
        email: '',
        phone: '',
        status: 'lead',
        notes: ''
      });
      await load();
    } catch {
      Alert.alert('Failed to create contact');
    }
  }
  if (loading && !items.length) return <Loading />;
  return <Screen>
      <View style={styles.top}>
        <Title emoji={featureEmoji.contacts} subtitle={`${items.length} contacts`}>
          Contacts
        </Title>
        <Pressable style={styles.add} onPress={() => setOpen(true)}>
          <Text style={styles.addText}>+ New</Text>
        </Pressable>
      </View>
      <FlatList data={items} keyExtractor={c => String(c.id)} contentContainerStyle={{
      paddingBottom: 24
    }} ListEmptyComponent={<Empty text="No contacts yet" emoji={featureEmoji.contacts} />} renderItem={({
      item
    }) => <Card>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{
          flex: 1
        }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>{item.email || item.phone || '—'}</Text>
                {item.notes ? <Text style={styles.notes} numberOfLines={2}>{item.notes}</Text> : null}
              </View>
              <Badge text={item.status || 'lead'} tone={item.status === 'active' ? 'success' : 'accent'} />
            </View>
          </Card>} />

      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New contact</Text>
            <Field label="Name" value={form.name} onChangeText={v => setForm({
            ...form,
            name: v
          })} />
            <Field label="Email" value={form.email} onChangeText={v => setForm({
            ...form,
            email: v
          })} keyboardType="email-address" />
            <Field label="Phone" value={form.phone} onChangeText={v => setForm({
            ...form,
            phone: v
          })} />
            <Field label="Notes" value={form.notes} onChangeText={v => setForm({
            ...form,
            notes: v
          })} />
            <PrimaryButton label="Save" onPress={create} />
            <Pressable onPress={() => setOpen(false)} style={{
            marginTop: 12
          }}>
              <Text style={{
              color: colors.muted,
              textAlign: 'center'
            }}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>;
}
const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between'
  },
  add: {
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 6
  },
  addText: {
    color: colors.white,
    fontWeight: '700'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800'
  },
  name: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2
  },
  notes: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end'
  },
  modal: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36
  },
  modalTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12
  }
});