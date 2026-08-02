import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ErrorBoundary } from "./src/components/ErrorBoundary"
import { AuthProvider } from "./src/context/AuthContext"
import RootNavigator from "./src/navigation/RootNavigator"

export default function App() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AuthProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </AuthProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  )
}
