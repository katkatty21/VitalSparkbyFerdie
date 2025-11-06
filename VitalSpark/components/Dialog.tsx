import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import { Platform, Pressable, ScrollView, View } from "react-native";

export interface DialogProps {
  visible: boolean;
  onDismiss?: () => void;
  children: ReactNode;
  dismissible?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  showCloseButton?: boolean;
}

export default function Dialog({
  visible,
  onDismiss,
  children,
  dismissible = true,
  maxWidth = 450,
  maxHeight = 600,
  showCloseButton = true,
}: DialogProps) {
  if (!visible) return null;

  // Responsive sizing based on viewport width
  const getResponsiveValues = () => {
    if (Platform.OS !== "web") {
      return {
        scale: 1,
        padding: 90,
        maxWidthPercentage: 0.9,
      };
    }

    const width = typeof window !== "undefined" ? window.innerWidth : 1280;
    const height = typeof window !== "undefined" ? window.innerHeight : 800;

    // Mobile
    if (width < 640) {
      return {
        scale: 0.85,
        padding: 16,
        maxWidthPercentage: 0.95,
        maxHeightPercentage: 0.9,
      };
    }

    // Tablet
    if (width < 1024) {
      return {
        scale: 0.95,
        padding: 32,
        maxWidthPercentage: 0.85,
        maxHeightPercentage: 0.85,
      };
    }

    // Desktop
    return {
      scale: 1,
      padding: 40,
      maxWidthPercentage: 0.9,
      maxHeightPercentage: 0.9,
    };
  };

  const { scale, padding, maxWidthPercentage, maxHeightPercentage } =
    getResponsiveValues();

  const handleBackdropPress = () => {
    if (dismissible && onDismiss) {
      onDismiss();
    }
  };

  const calculatedMaxWidth =
    Platform.OS === "web" && typeof window !== "undefined"
      ? Math.min(maxWidth * scale, window.innerWidth * maxWidthPercentage)
      : maxWidth * scale;

  const calculatedMaxHeight =
    Platform.OS === "web" && typeof window !== "undefined"
      ? Math.min(
          maxHeight * scale,
          window.innerHeight * (maxHeightPercentage || 0.9)
        )
      : maxHeight * scale;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: padding * scale,
      }}
    >
      {/* Backdrop */}
      <Pressable
        onPress={handleBackdropPress}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      {/* Dialog Content */}
      <View
        style={{
          backgroundColor: "white",
          borderRadius: 16 * scale,
          maxWidth: calculatedMaxWidth,
          maxHeight: calculatedMaxHeight,
          width: "100%",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          ...(Platform.OS === "web" && {
            // @ts-ignore - web only
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.2)",
          }),
        }}
      >
        {/* Close Button */}
        {showCloseButton && onDismiss && (
          <Pressable
            onPress={onDismiss}
            hitSlop={8}
            style={{
              position: "absolute",
              top: 12 * scale,
              right: 12 * scale,
              zIndex: 10,
              width: 32 * scale,
              height: 32 * scale,
              borderRadius: 16 * scale,
              backgroundColor: "#f3f4f6",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="close" size={20 * scale} color="#6b7280" />
          </Pressable>
        )}

        <ScrollView
          contentContainerStyle={{
            padding: 24 * scale,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {children}
        </ScrollView>
      </View>
    </View>
  );
}
