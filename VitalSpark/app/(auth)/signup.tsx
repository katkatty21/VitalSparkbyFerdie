import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMemo, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInLeft, FadeOutLeft } from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { auth } from "../../hooks/useAuth";

const showAlert = (title: string, message: string) =>
  Alert.alert(title, message);

export default function SignUpScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPwdFocused, setIsPwdFocused] = useState(false);
  const [isConfirmPwdFocused, setIsConfirmPwdFocused] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  const keyboardVerticalOffset = useMemo(
    () => Math.max(insets.top, 16),
    [insets.top]
  );

  // Check if screen is small (< 1280 x 800) for web
  const isSmallScreen = useMemo(() => {
    if (Platform.OS !== "web") return false;
    return dimensions.width < 1280 || dimensions.height < 800;
  }, [dimensions]);

  // Check if screen is large (>= 1440 x 1024) for web
  const isLargeScreen = useMemo(() => {
    if (Platform.OS !== "web") return false;
    return dimensions.width >= 1440 && dimensions.height >= 1024;
  }, [dimensions]);

  // Responsive scale factor
  const scale = useMemo(() => {
    if (Platform.OS !== "web") return 1;

    // Scale down for small screens
    if (isSmallScreen) {
      const widthScale = Math.min(dimensions.width / 1280, 1);
      const heightScale = Math.min(dimensions.height / 800, 1);
      return Math.max(Math.min(widthScale, heightScale), 0.65);
    }

    // Scale up for large screens
    if (isLargeScreen) {
      const widthScale = dimensions.width / 1280;
      const heightScale = dimensions.height / 800;
      return Math.min(widthScale, heightScale, 1.5); // Cap at 1.5x
    }

    return 1;
  }, [isSmallScreen, isLargeScreen, dimensions]);

  // Track window dimensions on web
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  // Remove autofill styling for web
  useEffect(() => {
    if (Platform.OS === "web") {
      const style = document.createElement("style");
      style.textContent = `
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-background-clip: text;
          -webkit-text-fill-color: #0f172a !important;
          transition: background-color 5000s ease-in-out 0s;
          box-shadow: inset 0 0 20px 20px white !important;
        }
      `;
      document.head.appendChild(style);
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

  const onSignUp = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showAlert("Missing info", "Please fill in all fields.");
      return;
    }

    if (!auth.validateEmail(email)) {
      showAlert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (password !== confirmPassword) {
      showAlert("Password Mismatch", "Passwords do not match.");
      return;
    }

    const passwordValidation = auth.validatePassword(password);
    if (!passwordValidation.isValid) {
      showAlert("Invalid Password", passwordValidation.message || "");
      return;
    }

    setLoading(true);
    try {
      const response = await auth.signUp({
        email: email.trim(),
        password: password,
      });

      if (response.success) {
        showAlert("Success", response.message);
        // Navigate back to login after successful signup
        router.replace("/(auth)/login");
      } else {
        showAlert("Sign Up Failed", response.message);
      }
    } catch (error: any) {
      showAlert("Error", error?.message || "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={keyboardVerticalOffset}
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={["#00b3b3", "#009898", "#006666", "#004c4c", "#002f2f"]}
          locations={[0, 0.2, 0.5, 0.8, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1, flexDirection: "column" }}
        >
          {/* TOP: Logo */}
          <View
            style={{
              width: "100%",
              height: isSmallScreen ? "35%" : isLargeScreen ? "35%" : "30%",
              justifyContent: "center",
              alignItems: "center",
              paddingVertical: isSmallScreen || isLargeScreen ? 40 * scale : 0,
            }}
          >
            <Image
              source={require("../../assets/images/Logo_VitalSpark_White.png")}
              resizeMode="contain"
              style={{ width: 160 * scale, height: 160 * scale }}
              accessibilityIgnoresInvertColors
              accessibilityLabel="VitalSpark logo"
            />
          </View>

          {/* BOTTOM: Card */}
          <Animated.View
            entering={FadeInLeft.duration(160)}
            exiting={FadeOutLeft.duration(120)}
            style={{
              width: "100%",
              height: isSmallScreen ? "65%" : isLargeScreen ? "65%" : "70%",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                borderTopLeftRadius: 24 * scale,
                borderTopRightRadius: 24 * scale,
                width: "100%",
                height: "100%",
              }}
            >
              <View style={{ flex: 1 }}>
                <ScrollView
                  contentContainerStyle={{
                    paddingHorizontal: 20 * scale,
                    paddingTop: 32 * scale,
                    paddingBottom: 30 * scale,
                  }}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    style={{
                      width: "100%",
                      maxWidth: 600,
                      marginHorizontal: "auto",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 36 * scale,
                        fontWeight: "800",
                        color: "#f59e0b",
                        textAlign: "center",
                        marginBottom: 8 * scale,
                      }}
                      accessibilityRole="header"
                    >
                      Sign Up
                    </Text>
                    <Text
                      style={{
                        fontSize: 14 * scale,
                        color: "#64748b",
                        textAlign: "center",
                        marginTop: 8 * scale,
                        marginBottom: 32 * scale,
                      }}
                    >
                      Create your account to get started.
                    </Text>

                    {/* Email */}
                    <View style={{ marginBottom: 20 * scale }}>
                      <Text
                        style={{
                          fontSize: 14 * scale,
                          color: "#334155",
                          marginBottom: 8 * scale,
                        }}
                      >
                        Email
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderRadius: 16 * scale,
                          backgroundColor: "white",
                          paddingHorizontal: 16 * scale,
                          borderWidth: 1,
                          borderColor: isEmailFocused ? "#0d9488" : "#e2e8f0",
                        }}
                      >
                        <Ionicons
                          name="mail-outline"
                          size={18 * scale}
                          color={isEmailFocused ? "#0d9488" : "#64748b"}
                        />
                        <TextInput
                          value={email}
                          onChangeText={setEmail}
                          placeholder="you@example.com"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#94a3b8"
                          returnKeyType="next"
                          onFocus={() => setIsEmailFocused(true)}
                          onBlur={() => setIsEmailFocused(false)}
                          style={
                            {
                              flex: 1,
                              paddingLeft: 12 * scale,
                              paddingVertical:
                                Platform.OS === "ios" ? 14 * scale : 12 * scale,
                              fontSize: 16 * scale,
                              color: "#0f172a",
                              backgroundColor: "white",
                              height: 48 * scale,
                              borderWidth: 0,
                              ...(Platform.OS === "web" && {
                                outlineStyle: "none",
                              }),
                            } as any
                          }
                          accessibilityLabel="Email address"
                        />
                      </View>
                    </View>

                    {/* Create Password */}
                    <View style={{ marginBottom: 20 * scale }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8 * scale,
                        }}
                      >
                        <Text
                          style={{ fontSize: 14 * scale, color: "#334155" }}
                        >
                          Create Password
                        </Text>
                        <Pressable
                          onPress={() => setShowPw((v) => !v)}
                          hitSlop={8}
                        >
                          <Text
                            style={{
                              fontSize: 14 * scale,
                              color: "#0d9488",
                              fontWeight: "500",
                            }}
                          >
                            {showPw ? "Hide" : "Show"}
                          </Text>
                        </Pressable>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderRadius: 16 * scale,
                          backgroundColor: "white",
                          paddingHorizontal: 16 * scale,
                          borderWidth: 1,
                          borderColor: isPwdFocused ? "#0d9488" : "#e2e8f0",
                        }}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18 * scale}
                          color={isPwdFocused ? "#0d9488" : "#64748b"}
                        />
                        <TextInput
                          value={password}
                          onChangeText={setPassword}
                          placeholder="•••••••"
                          secureTextEntry={!showPw}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#94a3b8"
                          returnKeyType="next"
                          onFocus={() => setIsPwdFocused(true)}
                          onBlur={() => setIsPwdFocused(false)}
                          style={
                            {
                              flex: 1,
                              paddingLeft: 12 * scale,
                              paddingVertical:
                                Platform.OS === "ios" ? 14 * scale : 12 * scale,
                              fontSize: 16 * scale,
                              color: "#0f172a",
                              backgroundColor: "white",
                              height: 48 * scale,
                              borderWidth: 0,
                              ...(Platform.OS === "web" && {
                                outlineStyle: "none",
                              }),
                            } as any
                          }
                          accessibilityLabel="Create password"
                        />
                      </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={{ marginBottom: 20 * scale }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8 * scale,
                        }}
                      >
                        <Text
                          style={{ fontSize: 14 * scale, color: "#334155" }}
                        >
                          Confirm Password
                        </Text>
                        <Pressable
                          onPress={() => setShowConfirmPw((v) => !v)}
                          hitSlop={8}
                        >
                          <Text
                            style={{
                              fontSize: 14 * scale,
                              color: "#0d9488",
                              fontWeight: "500",
                            }}
                          >
                            {showConfirmPw ? "Hide" : "Show"}
                          </Text>
                        </Pressable>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderRadius: 16 * scale,
                          backgroundColor: "white",
                          paddingHorizontal: 16 * scale,
                          borderWidth: 1,
                          borderColor: isConfirmPwdFocused
                            ? "#0d9488"
                            : "#e2e8f0",
                        }}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18 * scale}
                          color={isConfirmPwdFocused ? "#0d9488" : "#64748b"}
                        />
                        <TextInput
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="•••••••"
                          secureTextEntry={!showConfirmPw}
                          autoCapitalize="none"
                          autoCorrect={false}
                          placeholderTextColor="#94a3b8"
                          returnKeyType="done"
                          onSubmitEditing={onSignUp}
                          onFocus={() => setIsConfirmPwdFocused(true)}
                          onBlur={() => setIsConfirmPwdFocused(false)}
                          style={
                            {
                              flex: 1,
                              paddingLeft: 12 * scale,
                              paddingVertical:
                                Platform.OS === "ios" ? 14 * scale : 12 * scale,
                              fontSize: 16 * scale,
                              color: "#0f172a",
                              backgroundColor: "white",
                              height: 48 * scale,
                              borderWidth: 0,
                              ...(Platform.OS === "web" && {
                                outlineStyle: "none",
                              }),
                            } as any
                          }
                          accessibilityLabel="Confirm password"
                        />
                      </View>

                      {/* Spacing before button */}
                      <View style={{ marginBottom: 8 * scale }} />
                    </View>

                    {/* Sign Up Button */}
                    <Pressable
                      onPress={onSignUp}
                      disabled={loading}
                      style={{ width: "100%", marginBottom: 8 * scale }}
                    >
                      <LinearGradient
                        colors={["#FFB300", "#FF8A00"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={{
                          width: "100%",
                          paddingVertical: 16 * scale,
                          borderRadius: 16 * scale,
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: loading ? 0.8 : 1,
                        }}
                      >
                        {loading ? (
                          <ActivityIndicator color="#fff" size={18 * scale} />
                        ) : (
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "600",
                              fontSize: 18 * scale,
                            }}
                          >
                            Sign Up
                          </Text>
                        )}
                      </LinearGradient>
                    </Pressable>

                    {/* Footer */}
                    <View
                      style={{
                        alignItems: "center",
                        marginBottom: 32 * scale,
                      }}
                    >
                      <Text style={{ fontSize: 14 * scale, color: "#64748b" }}>
                        Already have an account?{" "}
                        <Text
                          style={{
                            fontSize: 14 * scale,
                            color: "#0d9488",
                            fontWeight: "600",
                          }}
                          onPress={handleSignIn}
                        >
                          Sign In
                        </Text>
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          </Animated.View>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
