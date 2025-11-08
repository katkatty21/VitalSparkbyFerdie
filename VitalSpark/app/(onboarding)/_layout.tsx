import { Stack, useRouter, useSegments } from "expo-router";
import { OnboardingHeaderProvider } from "../../contexts/OnboardingHeaderContext";
import { useOnboardingHeader } from "../../contexts/OnboardingHeaderContext";
import OnboardingHeader from "../../components/OnboardingHeader";
import { useMemo } from "react";

function OnboardingLayout() {
  const router = useRouter();
  const segments = useSegments();
  const { headerConfig } = useOnboardingHeader();

  // Determine current step based on route if not set in headerConfig
  const currentRoute = segments[segments.length - 1];
  const routeStepMap: Record<string, number> = {
    language: 1,
    mood: 2,
    profile: 3,
    location: 4,
    height: 5,
    weight: 6,
    fitness: 7,
    "target-muscle-group": 8,
    dietary: 9,
    finish: 9,
  };

  const currentStep = useMemo(() => {
    // Use headerConfig.currentStep if explicitly set, otherwise derive from route
    if (headerConfig.currentStep) {
      return headerConfig.currentStep;
    }
    return routeStepMap[currentRoute as string] || 1;
  }, [headerConfig.currentStep, currentRoute]);

  const handleBack = () => {
    // Only allow back navigation if canGoBack is not explicitly false
    if (headerConfig.canGoBack === false) {
      return; // Do nothing if back is disabled
    }

    if (headerConfig.onBack) {
      headerConfig.onBack();
    } else {
      router.back();
    }
  };

  // Get animation from headerConfig, default to slide_from_right
  const animation = headerConfig.animation || "slide_from_right";

  // Hide header on finish screen
  const showHeader = currentRoute !== "finish";

  return (
    <>
      {showHeader && (
        <OnboardingHeader
          currentStep={currentStep}
          totalSteps={headerConfig.totalSteps || 10}
          canGoNext={headerConfig.canGoNext}
          canGoBack={headerConfig.canGoBack}
          onBack={handleBack}
          onNext={headerConfig.onNext}
          nextDisabled={headerConfig.nextDisabled}
          nextIconColor={headerConfig.nextIconColor}
          backIconColor={headerConfig.backIconColor}
        />
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: animation,
        }}
      >
        <Stack.Screen name="language" />
        <Stack.Screen name="mood" />
        <Stack.Screen name="profile" />
        <Stack.Screen name="location" />
        <Stack.Screen name="height" />
        <Stack.Screen name="weight" />
        <Stack.Screen name="fitness" />
        <Stack.Screen name="target-muscle-group" />
        <Stack.Screen name="dietary" />
        <Stack.Screen name="finish" />
      </Stack>
    </>
  );
}

export default function OnboardingLayoutWrapper() {
  return (
    <OnboardingHeaderProvider>
      <OnboardingLayout />
    </OnboardingHeaderProvider>
  );
}
