import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NavigationContainer, DarkTheme } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from '../context/AuthContext'
import { colors, featureEmoji } from '../theme'
import { Loading } from '../components/ui'
import ChatBubble from '../components/ChatBubble'
import LoginScreen from '../screens/LoginScreen'
import SignupScreen from '../screens/SignupScreen'
import PlatformAdminScreen from '../screens/PlatformAdminScreen'
import DashboardScreen from '../screens/DashboardScreen'
import ContactsScreen from '../screens/ContactsScreen'
import DealsScreen from '../screens/DealsScreen'
import TasksScreen from '../screens/TasksScreen'
import NotificationsScreen from '../screens/NotificationsScreen'
import SettingsScreen from '../screens/SettingsScreen'
import type { AuthStackParamList } from './types'

const Stack = createNativeStackNavigator<AuthStackParamList>()
const Tab = createBottomTabNavigator()

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgCard,
    text: colors.text,
    border: colors.border,
    primary: colors.brand,
  },
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: featureEmoji.home,
    Contacts: featureEmoji.contacts,
    Deals: featureEmoji.deals,
    Tasks: featureEmoji.tasks,
    Alerts: featureEmoji.alerts,
    Setup: featureEmoji.settings,
  }
  return <Text style={{ fontSize: 17, opacity: focused ? 1 : 0.5 }}>{icons[label] || '•'}</Text>
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(12, 18, 34, 0.96)',
          borderTopColor: colors.border,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.brandSoft,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Contacts" component={ContactsScreen} />
      <Tab.Screen name="Deals" component={DealsScreen} options={{ title: 'Pipeline' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Alerts" component={NotificationsScreen} />
      <Tab.Screen name="Setup" component={SettingsScreen} options={{ title: 'Setup' }} />
    </Tab.Navigator>
  )
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="PlatformAdmin" component={PlatformAdminScreen} />
    </Stack.Navigator>
  )
}

export default function RootNavigator() {
  const { token, loading, isPlatform } = useAuth()
  if (loading) return <Loading />

  return (
    <NavigationContainer theme={navTheme}>
      {!token ? (
        <AuthStack />
      ) : isPlatform ? (
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
          <Stack.Screen name="PlatformAdmin" component={PlatformAdminScreen} />
        </Stack.Navigator>
      ) : (
        <View style={styles.root}>
          <MainTabs />
          <ChatBubble />
        </View>
      )}
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
})
