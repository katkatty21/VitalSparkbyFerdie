import { View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#00b3b3", "#009898", "#006666", "#004c4c", "#002f2f"]}
        locations={[0, 0.2, 0.5, 0.8, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.gradient}
      />

      <SafeAreaView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to VitalSpark!</Text>
          <Text style={styles.subtitle}>
            You're successfully signed in
          </Text>
          {user?.email && (
            <Text style={styles.email}>{user.email}</Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🎉 Authentication Complete</Text>
            <Text style={styles.infoText}>
              Your session is now persisted across app restarts and will remain active until you sign out.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔒 Protected Routes</Text>
            <Text style={styles.infoText}>
              You cannot access login or signup pages while authenticated. Auth routes are protected.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>📱 Cross-Platform</Text>
            <Text style={styles.infoText}>
              Works on mobile, web, and all platforms with seamless authentication persistence.
            </Text>
          </View>
        </View>

        <Pressable onPress={handleSignOut} style={styles.signOutButton}>
          <LinearGradient
            colors={["#FFB300", "#FF8A00"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.signOutGradient}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </LinearGradient>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    marginBottom: 8,
  },
  email: {
    fontSize: 14,
    color: "#f59e0b",
    textAlign: "center",
    fontWeight: "600",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  infoCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  signOutButton: {
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  signOutGradient: {
    width: "100%",
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 18,
  },
});

