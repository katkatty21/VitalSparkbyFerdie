import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasRedirectedRef = useRef(false);

  // Get current route within auth group
  const currentRoute = segments[1]; // (auth)/[currentRoute]

  // Don't redirect if on special auth pages that need to handle auth flows
  const specialAuthPages = ["callback", "reset-password", "email-verify"];

  const isSpecialPage = currentRoute && specialAuthPages.includes(currentRoute);

  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      hasRedirectedRef.current = false;
    }
  }, [isAuthenticated, isLoading]);

  useEffect(() => {
    if (isSpecialPage) {
      return; // Allow special pages to handle their own logic
    }

    // Redirect authenticated users away from login/signup/forgot-password immediately
    // Only redirect if we're actually on an auth page (not already navigating)
    if (
      !isLoading &&
      isAuthenticated &&
      currentRoute &&
      !hasRedirectedRef.current
    ) {
      hasRedirectedRef.current = true;
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, isSpecialPage, currentRoute]);

  // Show loading screen while checking authentication
  // This prevents flash of login page when user is already authenticated
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  // If authenticated and not on special page, show loader while redirecting
  if (isAuthenticated && !isSpecialPage) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "none",
        presentation: "card",
        animationDuration: 0,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="callback"
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="email-verify"
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          animation: "none",
          animationDuration: 0,
        }}
      />
    </Stack>
  );
}
