import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { UserProvider } from "../contexts/UserContext";
import { AuthProvider } from "../contexts/AuthContext";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { initI18n } from "../i18n";
import { View, ActivityIndicator } from "react-native";

function RootLayoutNav() {
  useProtectedRoute();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="index" />
    </Stack>
  );
}

export default function RootLayout() {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);

  useEffect(() => {
    initI18n().then(() => {
      setIsI18nInitialized(true);
    });
  }, []);

  if (!isI18nInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <UserProvider>
        <RootLayoutNav />
      </UserProvider>
    </AuthProvider>
  );
}
