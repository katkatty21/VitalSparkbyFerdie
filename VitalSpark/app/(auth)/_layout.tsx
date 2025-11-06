import { Stack } from "expo-router";

export default function AuthLayout() {
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
