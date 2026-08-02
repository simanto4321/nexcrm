import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api/client';
import { Badge, Card, Empty, Loading, Screen, Title } from '../components/ui';
import { colors, featureEmoji } from '../theme';
const STAGES = ['new', 'contacted', 'negotiation', 'won', 'lost'];
export default function DealsScreen() {
  const [items, setItems] = useState([]);
  const [stage, setStage] = useState('all');
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/deals');
      setItems(r.data);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(useCallback(() => {
    load().catch(() => setItems([]));
  }, [load]));
  const filtered = useMemo(() => stage === 'all' ? items : items.filter(d => d.stage === stage), [items, stage]);
  async function move(deal, next) {
    try {
      await api.put(`/deals/${deal.id}`, {
        stage: next
      });
      await load();
    } catch {
      Alert.alert('Could not update deal stage');
    }
  }
  if (loading && !items.length) return <Loading />;
  return <Screen>
      <Title emoji={featureEmoji.deals} subtitle={`${filtered.length} deals`}>
        Pipeline
      </Title>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{
      marginBottom: 12,
      maxHeight: 44
    }}>
        <Pressable style={[styles.chip, stage === 'all' && styles.chipOn]} onPress={() => setStage('all')}>
          <Text style={[styles.chipText, stage === 'all' && styles.chipTextOn]}>All</Text>
        </Pressable>
        {STAGES.map(s => <Pressable key={s} style={[styles.chip, stage === s && styles.chipOn]} onPress={() => setStage(s)}>
            <Text style={[styles.chipText, stage === s && styles.chipTextOn]}>{s}</Text>
          </Pressable>)}
      </ScrollView>

      <FlatList data={filtered} keyExtractor={d => String(d.id)} ListEmptyComponent={<Empty text="No deals in this stage" emoji={featureEmoji.deals} />} renderItem={({
      item
    }) => <Card>
            <View style={styles.row}>
              <View style={{
          flex: 1
        }}>
                <Text style={styles.title}>Deal #{item.id}</Text>
                <Text style={styles.value}>${item.value.toLocaleString()}</Text>
              </View>
              <Badge text={item.stage} tone={item.stage === 'won' ? 'success' : 'accent'} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{
        marginTop: 12
      }}>
              {STAGES.filter(s => s !== item.stage).map(s => <Pressable key={s} style={styles.move} onPress={() => move(item, s)}>
                  <Text style={styles.moveText}>→ {s}</Text>
                </Pressable>)}
            </ScrollView>
          </Card>} />
    </Screen>;
}
const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: colors.bgCard
  },
  chipOn: {
    backgroundColor: colors.brand,
    borderColor: colors.brand
  },
  chipText: {
    color: colors.muted,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize'
  },
  chipTextOn: {
    color: colors.white
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 16
  },
  value: {
    color: colors.accent,
    fontWeight: '800',
    fontSize: 20,
    marginTop: 4
  },
  move: {
    backgroundColor: colors.bgElevated,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  moveText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600'
  }
});