import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

interface StepBarProps {
  currentStep: number; // Current active step (1-based)
  totalSteps: number; // Total number of steps
  activeColor?: string; // Color for active steps
  inactiveColor?: string; // Color for inactive steps
  stepWidth?: number; // Width of each step
  stepHeight?: number; // Height of each step
  spacing?: number; // Spacing between steps
  borderRadius?: number; // Border radius for each step
  animationDuration?: number; // Duration for each bar animation
  animationStagger?: number; // Delay between bars when animating
}

export default function StepBar({
  currentStep,
  totalSteps = 10,
  activeColor = "#059669",
  inactiveColor = "#e5e7eb",
  stepWidth = 20,
  stepHeight = 6,
  spacing = 6,
  borderRadius = 4,
  animationDuration = 300,
  animationStagger = 40,
}: StepBarProps) {
  const animatedValues = useRef(
    Array.from({ length: totalSteps }, () => new Animated.Value(0))
  ).current;

  // Track previous step to decide stagger direction
  const prevStepRef = useRef<number>(currentStep);

  useEffect(() => {
    // If totalSteps prop ever changes across renders, ensure we have enough animated values
    if (animatedValues.length !== totalSteps) {
      // Note: In typical onboarding, totalSteps stays stable. If needed, this
      // could be extended to push new Animated.Values to match totalSteps.
    }

    const isForward = currentStep >= prevStepRef.current;
    const indices = Array.from({ length: totalSteps }, (_, i) => i);
    const ordered = isForward ? indices : indices.reverse();

    const animations = ordered.map((index) => {
      const isActive = index < currentStep;
      return Animated.timing(animatedValues[index], {
        toValue: isActive ? 1 : 0,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // backgroundColor interpolation requires false
      });
    });

    Animated.stagger(animationStagger, animations).start(() => {
      prevStepRef.current = currentStep;
    });
  }, [
    currentStep,
    totalSteps,
    animatedValues,
    animationDuration,
    animationStagger,
  ]);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {Array.from({ length: totalSteps }, (_, index) => {
        const animatedValue = animatedValues[index];
        return (
          <Animated.View
            key={index}
            style={{
              width: stepWidth,
              height: stepHeight,
              borderRadius,
              backgroundColor: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [inactiveColor, activeColor],
              }),
              marginRight: index !== totalSteps - 1 ? spacing : 0,
              transform: [
                {
                  scaleY: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.4],
                  }),
                },
                {
                  scaleX: animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.05],
                  }),
                },
              ],
            }}
          />
        );
      })}
    </View>
  );
}
