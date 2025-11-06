import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useUserData } from "../../hooks/useUserData";
import { useUserContext } from "../../contexts/UserContext";
import { auth } from "../../hooks/useAuth";
import { UserProfile } from "../../types/UserProfile";

// ===========================
// Example Component
// ===========================

export function UserProfileExample(): React.ReactElement {
  const { userProfile, userRole, loadingState } = useUserContext();
  const {
    createUserProfile,
    updateUserProfile,
    upsertUserProfile,
    fetchUserProfile,
    isLoading: operationLoading,
    error: operationError,
  } = useUserData();

  const [fullName, setFullName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [fitnessGoal, setFitnessGoal] = useState<string>("");

  useEffect(() => {
    if (userProfile) {
      setFullName(userProfile.full_name || "");
      setNickname(userProfile.nickname || "");
      setFitnessGoal(userProfile.fitness_goal || "");
    }
  }, [userProfile]);

  const handleCreateProfile = async (): Promise<void> => {
    const userResponse = await auth.getCurrentUser();
    if (!userResponse.success || !userResponse.data) {
      console.error("No authenticated user");
      return;
    }

    const newProfile: UserProfile = {
      user_id: userResponse.data.id,
      full_name: fullName,
      nickname: nickname,
      fitness_goal: fitnessGoal,
      current_step: 1,
      is_onboarding_complete: false,
      plan_code: "free",
    };

    const result = await createUserProfile(newProfile);
    if (result.success) {
      console.log("Profile created successfully!");
    } else {
      console.error("Error creating profile:", result.error);
    }
  };

  const handleUpdateProfile = async (): Promise<void> => {
    if (!userProfile) {
      console.error("No profile to update");
      return;
    }

    const result = await updateUserProfile(userProfile.user_id, {
      full_name: fullName,
      nickname: nickname,
      fitness_goal: fitnessGoal,
    });

    if (result.success) {
      console.log("Profile updated successfully!");
    } else {
      console.error("Error updating profile:", result.error);
    }
  };

  const handleUpsertProfile = async (): Promise<void> => {
    const userResponse = await auth.getCurrentUser();
    if (!userResponse.success || !userResponse.data) {
      console.error("No authenticated user");
      return;
    }

    const profileData: UserProfile = {
      user_id: userResponse.data.id,
      full_name: fullName,
      nickname: nickname,
      fitness_goal: fitnessGoal,
      current_step: userProfile?.current_step || 1,
      is_onboarding_complete: userProfile?.is_onboarding_complete || false,
      plan_code: userProfile?.plan_code || "free",
    };

    const result = await upsertUserProfile(profileData);
    if (result.success) {
      console.log("Profile upserted successfully!");
    } else {
      console.error("Error upserting profile:", result.error);
    }
  };

  const handleFetchProfile = async (): Promise<void> => {
    const userResponse = await auth.getCurrentUser();
    if (!userResponse.success || !userResponse.data) {
      console.error("No authenticated user");
      return;
    }

    const result = await fetchUserProfile(userResponse.data.id);
    if (result.success) {
      console.log("Profile fetched successfully!");
    } else {
      console.error("Error fetching profile:", result.error);
    }
  };

  if (loadingState.isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Loading user data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        User Profile Management
      </Text>

      {/* Display Current Profile */}
      <View
        style={{
          marginBottom: 30,
          padding: 15,
          backgroundColor: "#f0f0f0",
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Current Profile
        </Text>
        {userProfile ? (
          <View>
            <Text>Name: {userProfile.full_name || "Not set"}</Text>
            <Text>Nickname: {userProfile.nickname || "Not set"}</Text>
            <Text>Fitness Goal: {userProfile.fitness_goal || "Not set"}</Text>
            <Text>Step: {userProfile.current_step || 1}</Text>
            <Text>Plan: {userProfile.plan_code || "free"}</Text>
            <Text>
              Onboarding Complete:{" "}
              {userProfile.is_onboarding_complete ? "Yes" : "No"}
            </Text>
          </View>
        ) : (
          <Text>No profile found</Text>
        )}
      </View>

      {/* Display Current Role */}
      <View
        style={{
          marginBottom: 30,
          padding: 15,
          backgroundColor: "#f0f0f0",
          borderRadius: 8,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
          Current Role
        </Text>
        {userRole ? (
          <Text>Role: {userRole.role}</Text>
        ) : (
          <Text>No role found</Text>
        )}
      </View>

      {/* Form Inputs */}
      <View style={{ marginBottom: 20 }}>
        <Text style={{ marginBottom: 5, fontWeight: "bold" }}>Full Name</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
          }}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Enter full name"
        />

        <Text style={{ marginBottom: 5, fontWeight: "bold" }}>Nickname</Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
          }}
          value={nickname}
          onChangeText={setNickname}
          placeholder="Enter nickname"
        />

        <Text style={{ marginBottom: 5, fontWeight: "bold" }}>
          Fitness Goal
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            padding: 10,
            borderRadius: 5,
            marginBottom: 15,
          }}
          value={fitnessGoal}
          onChangeText={setFitnessGoal}
          placeholder="Enter fitness goal"
        />
      </View>

      {/* Action Buttons */}
      <View style={{ gap: 10 }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handleFetchProfile}
          disabled={operationLoading}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {operationLoading ? "Loading..." : "Fetch Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#34C759",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handleCreateProfile}
          disabled={operationLoading || !!userProfile}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {operationLoading ? "Creating..." : "Create Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#FF9500",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handleUpdateProfile}
          disabled={operationLoading || !userProfile}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {operationLoading ? "Updating..." : "Update Profile"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: "#5856D6",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handleUpsertProfile}
          disabled={operationLoading}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {operationLoading
              ? "Upserting..."
              : "Upsert Profile (Create or Update)"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Error Display */}
      {(operationError || loadingState.error) && (
        <View
          style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: "#FFE5E5",
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#D32F2F", fontWeight: "bold" }}>Error:</Text>
          <Text style={{ color: "#D32F2F" }}>
            {operationError || loadingState.error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// ===========================
// Example: Onboarding Progress Tracker
// ===========================

export function OnboardingProgressExample(): React.ReactElement {
  const { userProfile } = useUserContext();
  const { updateUserProfile, isLoading } = useUserData();

  const handleNextStep = async (): Promise<void> => {
    if (!userProfile) return;

    const nextStep = (userProfile.current_step || 1) + 1;
    const isComplete = nextStep > 10;

    const result = await updateUserProfile(userProfile.user_id, {
      current_step: nextStep,
      is_onboarding_complete: isComplete,
    });

    if (result.success) {
      console.log(`Moved to step ${nextStep}`);
    }
  };

  const handlePreviousStep = async (): Promise<void> => {
    if (!userProfile || (userProfile.current_step || 1) <= 1) return;

    const previousStep = (userProfile.current_step || 1) - 1;

    const result = await updateUserProfile(userProfile.user_id, {
      current_step: previousStep,
      is_onboarding_complete: false,
    });

    if (result.success) {
      console.log(`Moved back to step ${previousStep}`);
    }
  };

  if (!userProfile) {
    return <Text>No profile found</Text>;
  }

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
        Onboarding Progress
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 18 }}>
          Current Step: {userProfile.current_step || 1} / 10
        </Text>
        <Text style={{ fontSize: 16, marginTop: 10 }}>
          Status:{" "}
          {userProfile.is_onboarding_complete ? "Completed" : "In Progress"}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#FF9500",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handlePreviousStep}
          disabled={isLoading || (userProfile.current_step || 1) <= 1}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#34C759",
            padding: 15,
            borderRadius: 8,
            alignItems: "center",
          }}
          onPress={handleNextStep}
          disabled={isLoading || userProfile.is_onboarding_complete}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            {userProfile.is_onboarding_complete ? "Completed" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
