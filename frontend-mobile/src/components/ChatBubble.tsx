import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { colors, featureEmoji } from '../theme'

type Msg = { role: 'user' | 'assistant'; content: string }

export default function ChatBubble() {
  const { token } = useAuth()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([])
  const [loading, setLoading] = useState(false)
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start()
  }, [])

  async function send(text: string) {
    if (!token || !text.trim() || loading) return
    const userMsg: Msg = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const history = messages.map((m) => ({ role: m.role, text: m.content }))
      const { data } = await api.post<{ reply: string }>('/chatbot/message', {
        message: text.trim(),
        conversation_history: history,
      })
      setMessages([...next, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'I could not reply right now. Please try again in a moment.' }])
    } finally {
      setLoading(false)
    }
  }

  if (!token) return null

  return (
    <>
      <Animated.View style={[styles.fabWrap, { transform: [{ scale: pulse }] }]}>
        <Pressable style={styles.fab} onPress={() => setOpen(true)}>
          <Text style={styles.fabEmoji}>{featureEmoji.ai}</Text>
        </Pressable>
      </Animated.View>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView style={styles.modalRoot} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.panel}>
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>{featureEmoji.ai} NexCRM Assistant</Text>
                <Text style={styles.headerSub}>Ask about contacts, deals & tasks</Text>
              </View>
              <Pressable onPress={() => setOpen(false)} style={styles.close}>
                <Text style={{ color: colors.white, fontSize: 18 }}>×</Text>
              </Pressable>
            </View>

            <FlatList
              data={messages}
              keyExtractor={(_, i) => String(i)}
              contentContainerStyle={{ padding: 14, flexGrow: 1 }}
              ListEmptyComponent={
                <Text style={styles.empty}>👋 Hi! Ask me anything about your pipeline.</Text>
              }
              renderItem={({ item }) => (
                <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.botBubble]}>
                  <Text style={[styles.bubbleText, item.role === 'user' && { color: colors.white }]}>
                    {item.content}
                  </Text>
                </View>
              )}
            />

            {loading ? <ActivityIndicator color={colors.brand} style={{ marginBottom: 8 }} /> : null}

            <View style={styles.composer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message…"
                placeholderTextColor={colors.muted}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={() => send(input)}
              />
              <Pressable style={styles.send} onPress={() => send(input)}>
                <Text style={{ color: colors.white, fontWeight: '800' }}>Send</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  fabWrap: {
    position: 'absolute',
    right: 18,
    bottom: 88,
    zIndex: 100,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.brand,
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  fabEmoji: { fontSize: 26 },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  panel: {
    height: '78%',
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    backgroundColor: colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: colors.white, fontWeight: '800', fontSize: 16 },
  headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { color: colors.muted, textAlign: 'center', marginTop: 40, paddingHorizontal: 24 },
  bubble: { maxWidth: '82%', borderRadius: 16, padding: 12, marginBottom: 10 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.brand },
  botBubble: { alignSelf: 'flex-start', backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  bubbleText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  composer: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  send: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
})
