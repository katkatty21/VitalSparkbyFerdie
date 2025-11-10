import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useUserContext } from "@/contexts/UserContext";
import { useMobileWebRedirect } from "@/hooks/useMobileWebRedirect";
import Dialog from "@/components/Dialog";

interface SettingToggleProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

const SettingToggle = ({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: SettingToggleProps) => (
  <View className="flex-row items-center py-3 px-3 rounded-xl">
    <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 shrink-0">
      <Ionicons name={icon} size={18} color="#0f766e" />
    </View>
    <View className="flex-1 shrink grow pr-3 self-center">
      <Text
        className="text-[15px] font-semibold text-gray-900 mb-0.5"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      <Text
        className="text-[13px] text-gray-500"
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {description}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: "#e5e7eb", true: "#a7f3d0" }}
      thumbColor={value ? "#0f766e" : "#9ca3af"}
      className="ml-2 shrink-0"
    />
  </View>
);

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  onPress: () => void;
  showChevron?: boolean;
  textColor?: string;
}

const SettingItem = ({
  icon,
  title,
  description,
  onPress,
  showChevron = true,
  textColor = "#111827",
}: SettingItemProps) => (
  <Pressable
    onPress={onPress}
    className="rounded-xl active:opacity-90"
    accessibilityRole="button"
  >
    <View className="flex-row items-center py-3 px-3">
      <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3 shrink-0">
        <Ionicons name={icon} size={18} color="#0f766e" />
      </View>
      <View className="flex-1 shrink grow pr-3 self-center">
        <Text
          className="text-[15px] font-semibold mb-0.5"
          style={{ color: textColor }}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {description && (
          <Text
            className="text-[13px] text-gray-500"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
        )}
      </View>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color="#9ca3af"
          className="ml-1 shrink-0"
        />
      )}
    </View>
  </Pressable>
);

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
}

const SectionCard = ({ title, children }: SectionCardProps) => (
  <View
    className="bg-white rounded-[20px] border border-gray-200 mb-6 overflow-hidden"
    style={styles.sectionCardShadow}
  >
    <View className="px-4 py-3 bg-slate-50 border-b border-gray-200">
      <Text className="text-xs tracking-[2px] font-bold text-gray-500 uppercase">
        {title}
      </Text>
    </View>
    <View className="px-2 py-2">{children}</View>
  </View>
);

const Divider = () => <View className="h-[1px] bg-gray-200 mx-3 my-0" />;

export default function MyProfileScreen() {
  const { user, signOut } = useAuth();
  const { userProfile, loadingState } = useUserContext();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bmiModalOpen, setBmiModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const screenHeight = Dimensions.get("window").height;
  const screenWidth = Dimensions.get("window").width;
  const isWeb = Platform.OS === "web";
  const viewportHeight =
    isWeb && typeof window !== "undefined" ? window.innerHeight : screenHeight;
  const isSmallViewport = viewportHeight < 700 || screenWidth < 400;

  useMobileWebRedirect();

  const calculateBMI = (): string | null => {
    const height = userProfile?.height;
    const weight = userProfile?.weight;
    const heightUnit = userProfile?.height_unit;
    const weightUnit = userProfile?.weight_unit;

    if (!height || !weight) return null;

    // Convert height to meters
    let heightInMeters: number;
    if (heightUnit === "inches") {
      heightInMeters = height * 0.0254;
    } else if (heightUnit === "feet") {
      heightInMeters = height * 0.3048;
    } else {
      heightInMeters = height / 100; // cm to meters
    }

    // Convert weight to kg
    let weightInKg: number;
    if (weightUnit === "lbs" || weightUnit === "pounds") {
      weightInKg = weight * 0.453592;
    } else {
      weightInKg = weight;
    }

    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMIClassification = (bmi: string | null) => {
    if (!bmi) return null;

    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) {
      return {
        label: "Underweight",
        color: "#3b82f6",
        bgColor: "#dbeafe",
      };
    } else if (bmiValue >= 18.5 && bmiValue <= 24.9) {
      return {
        label: "Healthy Weight",
        color: "#10b981",
        bgColor: "#d1fae5",
      };
    } else if (bmiValue >= 25.0 && bmiValue <= 29.9) {
      return {
        label: "Overweight",
        color: "#f59e0b",
        bgColor: "#fef3c7",
      };
    } else {
      return {
        label: "Obesity",
        color: "#ef4444",
        bgColor: "#fee2e2",
      };
    }
  };

  const formatHeight = (): string => {
    const height = userProfile?.height;
    const heightUnit = userProfile?.height_unit;

    if (!height) return "N/A";

    if (heightUnit === "inches") {
      const feet = Math.floor(height / 12);
      const inches = Math.round(height % 12);
      return `${feet}'${inches}"`;
    } else if (heightUnit === "feet") {
      return `${height} ft`;
    } else {
      return `${height} cm`;
    }
  };

  const formatWeight = (): string => {
    const weight = userProfile?.weight;
    const weightUnit = userProfile?.weight_unit;

    if (!weight) return "N/A";

    const unit = weightUnit || "kg";
    return `${weight} ${unit}`;
  };

  const handleManageProfile = () => {
    router.push("/(tabs)/manage-profile");
  };

  const handleSignOut = async () => {
    if (!user) {
      Alert.alert("No user session", "You are not currently signed in.");
      return;
    }

    if (Platform.OS === "web") {
      setConfirmOpen(true);
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  const confirmSignOut = async () => {
    if (busy) return;

    if (!user) {
      Alert.alert("No user session", "You are not currently signed in.");
      setConfirmOpen(false);
      return;
    }

    try {
      setBusy(true);
      await signOut();
    } catch (error) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  };

  const getPlanBadgeText = (): string => {
    const planCode = userProfile?.plan_code?.toLowerCase();
    if (planCode === "premium") return "Premium Member";
    if (planCode === "pro") return "Pro Member";
    return "VitalSpark Member";
  };

  const getPlanBadgeColors = (): { bg: string; text: string } => {
    const planCode = userProfile?.plan_code?.toLowerCase();
    if (planCode === "premium") return { bg: "#fef3c7", text: "#f59e0b" };
    if (planCode === "pro") return { bg: "#dbeafe", text: "#3b82f6" };
    return { bg: "#fef3c7", text: "#f59e0b" };
  };

  if (loadingState.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 justify-center items-center">
          <Text className="text-base text-gray-500">Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* HERO BAND */}
      <LinearGradient
        colors={["#0d9488", "#0f766e", "#134e4a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-10 pb-[140px] rounded-b-[22px]"
      >
        <Text className="text-white/90 text-xs tracking-[2px] uppercase font-semibold">
          ACCOUNT
        </Text>
        <Text className="text-white text-[32px] font-extrabold mt-1">
          My Profile
        </Text>
        <Text className="text-teal-100 text-[13px] mt-1">
          Manage your identity and preferences
        </Text>
      </LinearGradient>

      <ScrollView
        className="flex-1 -mt-32"
        contentContainerStyle={{ paddingHorizontal: 24 }}
        scrollEnabled={!confirmOpen}
        showsVerticalScrollIndicator={false}
      >
        {/* OVERLAPPING PROFILE CARD */}
        <View
          className="bg-white rounded-[20px] border border-gray-200 px-5 py-6 mb-6"
          style={styles.profileCardShadow}
        >
          {/* Centered Icon with Amber Gradient */}
          <View className="items-center mb-4">
            <LinearGradient
              colors={["#f59e0b", "#d97706", "#b45309"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-20 h-20 rounded-[20px] items-center justify-center"
            >
              <Ionicons name="person" size={42} color="#ffffff" />
            </LinearGradient>
          </View>

          {/* Email and Member Chip */}
          <View className="items-center mb-6">
            <Text
              className="text-base font-bold text-gray-900 mb-2"
              numberOfLines={1}
            >
              {user?.email || "User"}
            </Text>
            <View
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: getPlanBadgeColors().bg }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: getPlanBadgeColors().text }}
              >
                {getPlanBadgeText()}
              </Text>
            </View>
          </View>

          {/* Height, Weight, BMI - 3 Columns */}
          <View className="flex-row justify-between mb-6">
            <View className="flex-1 items-center">
              <Text className="text-[11px] text-gray-500 uppercase tracking-[1px] mb-1">
                HEIGHT
              </Text>
              <Text className="text-base font-bold text-gray-900">
                {formatHeight()}
              </Text>
            </View>
            <View className="w-[1px] bg-gray-200 mx-2" />
            <View className="flex-1 items-center">
              <Text className="text-[11px] text-gray-500 uppercase tracking-[1px] mb-1">
                WEIGHT
              </Text>
              <Text className="text-base font-bold text-gray-900">
                {formatWeight()}
              </Text>
            </View>
            <View className="w-[1px] bg-gray-200 mx-2" />
            <View className="flex-1 items-center">
              <View className="flex-row items-center mb-1">
                <Text className="text-[11px] text-gray-500 uppercase tracking-[1px]">
                  BMI
                </Text>
                {calculateBMI() && (
                  <Pressable
                    onPress={() => setBmiModalOpen(true)}
                    className="ml-1"
                  >
                    <View
                      className="w-4 h-4 rounded-lg items-center justify-center"
                      style={{
                        backgroundColor:
                          getBMIClassification(calculateBMI())?.bgColor ||
                          "#f3f4f6",
                      }}
                    >
                      <Ionicons
                        name="information-circle"
                        size={10}
                        color={
                          getBMIClassification(calculateBMI())?.color ||
                          "#6b7280"
                        }
                      />
                    </View>
                  </Pressable>
                )}
              </View>
              <Text className="text-base font-bold text-gray-900">
                {calculateBMI() || "N/A"}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <Pressable
              onPress={handleManageProfile}
              className="flex-1 h-12 rounded-2xl overflow-hidden"
              style={styles.manageButtonShadow}
            >
              <LinearGradient
                colors={["#f59e0b", "#d97706"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-1 items-center justify-center px-3"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="settings"
                    size={14}
                    color="#ffffff"
                    className="mr-1.5"
                  />
                  <Text
                    className="text-[13px] font-semibold text-white"
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                    minimumFontScale={0.8}
                  >
                    Manage Profile
                  </Text>
                </View>
              </LinearGradient>
            </Pressable>

            {/* Sign Out Button - Secondary Action */}
            {user && (
              <Pressable
                onPress={handleSignOut}
                className="w-[38%] h-12 rounded-2xl overflow-hidden"
                style={styles.signOutButtonShadow}
              >
                <LinearGradient
                  colors={["#ef4444", "#dc2626"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="flex-1 items-center justify-center px-3"
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="log-out-outline"
                      size={14}
                      color="#ffffff"
                      className="mr-1.5"
                    />
                    <Text
                      className="text-[13px] font-semibold text-white"
                      numberOfLines={1}
                      adjustsFontSizeToFit={true}
                      minimumFontScale={0.8}
                    >
                      Sign Out
                    </Text>
                  </View>
                </LinearGradient>
              </Pressable>
            )}
          </View>
        </View>

        {/* PREFERENCES */}
        <SectionCard title="PREFERENCES">
          <SettingToggle
            icon="notifications"
            title="Push Notifications"
            description="Receive workout reminders and updates"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />
          <Divider />
          <SettingToggle
            icon="moon"
            title="Dark Mode"
            description="Use dark theme across the app"
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
          />
        </SectionCard>

        {/* SUPPORT */}
        <SectionCard title="SUPPORT">
          <SettingItem
            icon="help-circle"
            title="Help Center"
            description="Get answers to your questions"
            onPress={() => {
              Alert.alert("Coming Soon", "Help Center will be available soon");
            }}
          />
          <Divider />
          <SettingItem
            icon="chatbubble-ellipses"
            title="Contact Support"
            description="Get help from our team"
            onPress={() => {
              Alert.alert("Coming Soon", "Support chat will be available soon");
            }}
          />
          <Divider />
          <SettingItem
            icon="star"
            title="Rate VitalSpark"
            description="Share your feedback with us"
            onPress={() => {
              Alert.alert(
                "Thank You!",
                "We appreciate your feedback and support"
              );
            }}
          />
        </SectionCard>

        {/* ABOUT */}
        <SectionCard title="ABOUT">
          <SettingItem
            icon="information-circle"
            title="App Version"
            description="1.0.0"
            onPress={() => {}}
            showChevron={false}
          />
          <Divider />
          <SettingItem
            icon="document-text"
            title="Terms of Service"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Terms of Service will be available soon"
              );
            }}
          />
          <Divider />
          <SettingItem
            icon="shield-checkmark"
            title="Privacy Policy"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Privacy Policy will be available soon"
              );
            }}
          />
        </SectionCard>

        <View className="h-10" />
      </ScrollView>

      {/* Sign Out Confirmation Dialog */}
      <Dialog
        visible={confirmOpen}
        onDismiss={!busy ? () => setConfirmOpen(false) : undefined}
        dismissible={!busy}
        maxWidth={440}
        showCloseButton={!busy}
      >
        <View>
          <Text className="text-lg font-bold text-gray-900">Sign Out</Text>
          <Text className="text-gray-600 mt-1.5">
            Are you sure you want to sign out?
          </Text>
          <View className="flex-row justify-end mt-4">
            <Pressable
              disabled={busy}
              onPress={() => setConfirmOpen(false)}
              className="py-2.5 px-4 rounded-xl border border-gray-200 bg-white"
            >
              <Text className="text-gray-900 font-semibold">Cancel</Text>
            </Pressable>
            <Pressable
              disabled={busy}
              onPress={confirmSignOut}
              className="py-2.5 px-4 rounded-xl ml-2.5"
              style={{ backgroundColor: busy ? "#f87171" : "#ef4444" }}
            >
              <Text className="text-white font-bold">
                {busy ? "Signing Out..." : "Sign Out"}
              </Text>
            </Pressable>
          </View>
        </View>
      </Dialog>

      {/* BMI Information Dialog */}
      <Modal
        visible={bmiModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setBmiModalOpen(false)}
      >
        <Pressable
          onPress={() => setBmiModalOpen(false)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        />

        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              width: "100%",
              maxWidth: 400,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              ...(Platform.OS !== "web" && {
                shadowColor: "#000",
                shadowOpacity: 0.3,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 8 },
                elevation: 15,
              }),
            }}
          >
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: "#e5e7eb",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  backgroundColor:
                    getBMIClassification(calculateBMI())?.bgColor || "#f3f4f6",
                }}
              >
                <Ionicons
                  name="fitness"
                  size={20}
                  color={
                    getBMIClassification(calculateBMI())?.color || "#6b7280"
                  }
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: isSmallViewport ? 16 : 18,
                    fontWeight: "800",
                    color: "#111827",
                  }}
                >
                  Your BMI Result
                </Text>
                <Text
                  style={{
                    fontSize: isSmallViewport ? 13 : 14,
                    color: "#6b7280",
                    marginTop: 2,
                  }}
                >
                  Body Mass Index
                </Text>
              </View>
            </View>

            <ScrollView style={{ maxHeight: viewportHeight * 0.6 }}>
              <View style={{ padding: 20 }}>
                <View
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: isSmallViewport ? 40 : 48,
                      fontWeight: "900",
                      color:
                        getBMIClassification(calculateBMI())?.color ||
                        "#6b7280",
                      marginBottom: 4,
                    }}
                  >
                    {calculateBMI()}
                  </Text>
                  <Text
                    style={{
                      fontSize: isSmallViewport ? 13 : 14,
                      color: "#6b7280",
                      fontWeight: "600",
                    }}
                  >
                    BMI Score
                  </Text>
                </View>

                <View
                  style={{
                    alignItems: "center",
                    backgroundColor: "#f8fafc",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <Text
                    style={{
                      fontSize: isSmallViewport ? 13 : 14,
                      color: "#6b7280",
                      marginBottom: 8,
                    }}
                  >
                    Classification
                  </Text>
                  <View
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor:
                        getBMIClassification(calculateBMI())?.bgColor ||
                        "#f3f4f6",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: isSmallViewport ? 13 : 14,
                        fontWeight: "800",
                        color:
                          getBMIClassification(calculateBMI())?.color ||
                          "#6b7280",
                        letterSpacing: 0.5,
                      }}
                    >
                      {getBMIClassification(calculateBMI())?.label || ""}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    backgroundColor: "#f8fafc",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color="#0f766e"
                    />
                    <Text
                      style={{
                        fontSize: isSmallViewport ? 13 : 14,
                        fontWeight: "700",
                        color: "#111827",
                        marginLeft: 8,
                      }}
                    >
                      Health Tip
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: isSmallViewport ? 12 : 13,
                      color: "#6b7280",
                      lineHeight: 20,
                    }}
                  >
                    BMI is a screening tool. Consult with a healthcare
                    professional for personalized health advice.
                  </Text>
                </View>

                <View>
                  <Text
                    style={{
                      fontSize: isSmallViewport ? 13 : 14,
                      fontWeight: "800",
                      color: "#111827",
                      marginBottom: 12,
                    }}
                  >
                    BMI Ranges
                  </Text>
                  <View style={{ rowGap: 8 }}>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          marginRight: 12,
                          backgroundColor: "#3b82f6",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          flex: 1,
                        }}
                      >
                        Underweight
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        &lt; 18.5
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          marginRight: 12,
                          backgroundColor: "#10b981",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          flex: 1,
                        }}
                      >
                        Healthy Weight
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        18.5 - 24.9
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          marginRight: 12,
                          backgroundColor: "#f59e0b",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          flex: 1,
                        }}
                      >
                        Overweight
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        25.0 - 29.9
                      </Text>
                    </View>
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          marginRight: 12,
                          backgroundColor: "#ef4444",
                        }}
                      />
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          flex: 1,
                        }}
                      >
                        Obesity
                      </Text>
                      <Text
                        style={{
                          fontSize: isSmallViewport ? 12 : 13,
                          color: "#6b7280",
                          fontWeight: "600",
                        }}
                      >
                        ≥ 30.0
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <View
              style={{
                paddingHorizontal: 20,
                paddingVertical: 16,
                borderTopWidth: 1,
                borderTopColor: "#e5e7eb",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity
                onPress={() => setBmiModalOpen(false)}
                style={{
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "#0f766e",
                }}
              >
                <Text
                  style={{
                    fontSize: isSmallViewport ? 14 : 16,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  Got it
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Platform-specific shadows only
  profileCardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  manageButtonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#f59e0b",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 8px rgba(245, 158, 11, 0.25)",
      },
    }),
  },
  signOutButtonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#ef4444",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 8px rgba(239, 68, 68, 0.25)",
      },
    }),
  },
  sectionCardShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
      },
    }),
  },
});
