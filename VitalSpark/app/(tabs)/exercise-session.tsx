import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Line } from "react-native-svg";
import { supabase } from "@/utils/supabase";
import { useUserContext } from "@/contexts/UserContext";

interface ExerciseDetails {
  id: string;
  name: string;
  image_slug: string | null;
  default_safety_tip: string | null;
  primary_muscle: string | null;
}

interface Exercise {
  exercise_id: string;
  position: number;
  section: string;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  rest_seconds: number;
  safety_tip: string | null;
  per_side: boolean;
  details: ExerciseDetails | null;
}

interface WorkoutPlan {
  id: string;
  name: string;
  level: string;
  total_exercises: number | null;
}

export default function ExerciseSession() {
  const { planId } = useLocalSearchParams();
  const { userProfile } = useUserContext();
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentSet, setCurrentSet] = useState<number>(1);
  const [userGender, setUserGender] = useState<string>("male");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [isResting, setIsResting] = useState<boolean>(false);
  const [windowWidth, setWindowWidth] = useState<number>(
    Platform.OS === "web" && typeof window !== "undefined"
      ? window.innerWidth
      : Dimensions.get("window").width
  );

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    if (planId) {
      fetchWorkoutData();
    }
  }, [planId]);

  useEffect(() => {
    // Initialize timer when exercise or set changes
    const currentExercise = exercises[currentIndex];
    if (currentExercise?.duration_seconds && !isResting) {
      setTimer(currentExercise.duration_seconds);
    }
  }, [currentIndex, currentSet, exercises, isResting]);

  useEffect(() => {
    let interval: any;
    if (!isPaused && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, timer]);

  useEffect(() => {
    // Auto-proceed when timer reaches 0
    if (timer === 0 && !isPaused) {
      const currentExercise = exercises[currentIndex];
      if (!currentExercise) return;
      // Small delay for better UX
      const timeout = setTimeout(() => {
        handleNext();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [timer, isPaused, currentIndex, exercises]);

  const fetchWorkoutData = async () => {
    try {
      setIsLoading(true);
      // Get user gender from context
      if (userProfile?.gender) {
        setUserGender(userProfile.gender.toLowerCase());
      }

      // Fetch workout plan
      const { data: planData } = await supabase
        .from("workout_plans")
        .select("id, name, level, total_exercises")
        .eq("id", planId)
        .single();

      if (planData) {
        setWorkoutPlan(planData);
      }

      // Fetch exercises
      const { data: exercisesData } = await supabase
        .from("workout_plan_exercises")
        .select(
          `
          exercise_id,
          position,
          section,
          sets,
          reps,
          duration_seconds,
          rest_seconds,
          safety_tip,
          per_side,
          workout_plan_exercises_details (
            id,
            name,
            image_slug,
            default_safety_tip,
            primary_muscle
          )
        `
        )
        .eq("plan_id", planId)
        .order("position", { ascending: true });

      if (exercisesData) {
        const formattedExercises: Exercise[] = exercisesData.map((ex: any) => ({
          exercise_id: ex.exercise_id,
          position: ex.position,
          section: ex.section,
          sets: ex.sets,
          reps: ex.reps,
          duration_seconds: ex.duration_seconds,
          rest_seconds: ex.rest_seconds,
          safety_tip: ex.safety_tip,
          per_side: ex.per_side,
          details: ex.workout_plan_exercises_details || null,
        }));
        setExercises(formattedExercises);
      }
    } catch (error) {
      console.error("Error fetching workout data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getExerciseImageUrl = (section: string, imageSlug: string): string => {
    const baseUrl =
      "https://fvlaenpwxjnkzpbjnhrl.supabase.co/storage/v1/object/public/workouts/exercises/";
    return `${baseUrl}${userGender}/${section}/${imageSlug}.png`;
  };

  const handleNext = () => {
    const currentExercise = exercises[currentIndex];
    const totalSets = currentExercise?.sets || 1;

    // Check if we're in a rest period
    if (isResting) {
      // After rest, either start next set or move to next exercise
      if (currentSet < totalSets) {
        setCurrentSet(currentSet + 1);
        setIsResting(false);
      } else {
        // Move to next exercise
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setCurrentSet(1);
          setIsResting(false);
        }
      }
    } else {
      // Exercise just finished
      if (currentSet < totalSets) {
        // More sets remaining, show rest
        if (currentExercise?.rest_seconds > 0) {
          setIsResting(true);
          setTimer(currentExercise.rest_seconds);
        } else {
          // No rest, go directly to next set
          setCurrentSet(currentSet + 1);
        }
      } else {
        // All sets complete, move to next exercise
        if (currentIndex < exercises.length - 1) {
          if (currentExercise?.rest_seconds > 0) {
            setIsResting(true);
            setTimer(currentExercise.rest_seconds);
          } else {
            setCurrentIndex(currentIndex + 1);
            setCurrentSet(1);
          }
        }
      }
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const handleSkip = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentSet(1);
      setIsResting(false);
    }
  };

  const handleFinish = () => {
    router.push({
      pathname: "/(tabs)/workout-details",
      params: { id: planId },
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getSectionLabel = (section: string): string => {
    if (section === "warmup") return "Warm Up";
    if (section === "main") return "Main Exercise";
    if (section === "cooldown") return "Cool Down";
    return section;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d9488" />
          <Text style={styles.loadingText}>Loading workout...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>No exercises found</Text>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/workout-details",
                params: { id: planId },
              })
            }
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentExercise = exercises[currentIndex];
  const progress = ((currentIndex + 1) / exercises.length) * 100;
  const shouldShowTwoColumns: boolean =
    Platform.OS === "web" && windowWidth > 670;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Progress */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/(tabs)/workout-details",
                params: { id: planId },
              })
            }
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color="#0f766e" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {workoutPlan?.name || "Workout"}
            </Text>
            <Text style={styles.headerSubtitle}>
              {currentIndex + 1}/{exercises.length} •{" "}
              {getSectionLabel(currentExercise.section)}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.progressBarBg}>
          <LinearGradient
            colors={["#0d9488", "#14b8a6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${progress}%` }]}
          />
        </View>
      </View>

      {/* Main Content - No Scroll */}
      <View style={styles.content}>
        {/* Rest or Exercise State */}
        {isResting ? (
          <View style={styles.restContainer}>
            <Text style={styles.restTitle}>
              {currentSet < (currentExercise?.sets || 1)
                ? `Rest Time - Next: Set ${currentSet + 1}`
                : "Rest Time"}
            </Text>
            <View
              style={[
                styles.restTimerCircle,
                shouldShowTwoColumns && styles.restTimerCircleGrid,
              ]}
            >
              <Svg
                width={shouldShowTwoColumns ? 220 : 280}
                height={shouldShowTwoColumns ? 220 : 280}
                style={styles.restCircleSvg}
              >
                {/* Generate 60 tick marks around the circle */}
                {Array.from({ length: 60 }).map((_, index) => {
                  const svgSize = shouldShowTwoColumns ? 220 : 280;
                  const center = svgSize / 2;
                  const radius = shouldShowTwoColumns ? 105 : 135;
                  const angle = (index * 6 - 90) * (Math.PI / 180);
                  const tickLength = index % 5 === 0 ? 10 : 6;
                  const x1 = center + (radius - tickLength) * Math.cos(angle);
                  const y1 = center + (radius - tickLength) * Math.sin(angle);
                  const x2 = center + radius * Math.cos(angle);
                  const y2 = center + radius * Math.sin(angle);

                  const totalSeconds = currentExercise.rest_seconds;
                  const elapsedSeconds = totalSeconds - timer;
                  const progressPercentage = elapsedSeconds / totalSeconds;
                  const isActive = index / 60 < progressPercentage;

                  return (
                    <Line
                      key={index}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isActive ? "#f59e0b" : "#e5e7eb"}
                      strokeWidth={
                        index % 5 === 0
                          ? shouldShowTwoColumns
                            ? 2.5
                            : 3
                          : shouldShowTwoColumns
                            ? 1.5
                            : 2
                      }
                      strokeLinecap="round"
                    />
                  );
                })}
              </Svg>
              <View style={styles.restTimerTextContainer}>
                <Text
                  style={[
                    styles.restTimer,
                    shouldShowTwoColumns && styles.restTimerGrid,
                  ]}
                >
                  {formatTime(timer)}
                </Text>
                <Text
                  style={[
                    styles.restSubtext,
                    shouldShowTwoColumns && styles.restSubtextGrid,
                  ]}
                >
                  remaining
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.skipRestButton,
                shouldShowTwoColumns && styles.skipRestButtonGrid,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.skipRestText}>Skip Rest</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.exerciseContentWrapper,
              shouldShowTwoColumns && styles.exerciseContentWrapperGrid,
            ]}
          >
            {/* Left Column: Info + Image */}
            <View
              style={[
                styles.leftColumn,
                shouldShowTwoColumns && styles.leftColumnGrid,
              ]}
            >
              {/* Exercise Info */}
              <View
                style={[
                  styles.infoTextContainer,
                  shouldShowTwoColumns && styles.infoTextContainerGrid,
                ]}
              >
                {currentExercise.sets && currentExercise.sets > 1 && (
                  <View style={styles.infoTextRow}>
                    <Ionicons name="repeat" size={14} color="#0d9488" />
                    <Text style={styles.infoText}>
                      Set {currentSet} of {currentExercise.sets}
                    </Text>
                  </View>
                )}
                {currentExercise.reps && currentExercise.reps > 0 && (
                  <View style={styles.infoTextRow}>
                    <Ionicons name="fitness" size={14} color="#d97706" />
                    <Text style={styles.infoText}>
                      {currentExercise.reps === 1 ? "Rep" : "Reps"}:{" "}
                      {currentExercise.reps}
                    </Text>
                  </View>
                )}
                {currentExercise.rest_seconds &&
                  currentExercise.rest_seconds > 0 && (
                    <View style={styles.infoTextRow}>
                      <Ionicons name="time" size={14} color="#0284c7" />
                      <Text style={styles.infoText}>
                        Rest: {currentExercise.rest_seconds}s
                      </Text>
                    </View>
                  )}
              </View>

              {/* Exercise Image */}
              <View
                style={[
                  styles.imageContainer,
                  shouldShowTwoColumns && styles.imageContainerGrid,
                ]}
              >
                {currentExercise.details?.image_slug ? (
                  <Image
                    source={{
                      uri: getExerciseImageUrl(
                        currentExercise.section,
                        currentExercise.details.image_slug
                      ),
                    }}
                    style={styles.exerciseImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="fitness" size={60} color="#9ca3af" />
                  </View>
                )}
              </View>
            </View>

            {/* Right Column: Timer for duration-based exercises */}
            {currentExercise.duration_seconds && (
              <View
                style={[
                  styles.timerContainer,
                  shouldShowTwoColumns && styles.timerContainerGrid,
                ]}
              >
                <View
                  style={[
                    styles.circularProgressContainer,
                    shouldShowTwoColumns &&
                      styles.circularProgressContainerGrid,
                  ]}
                >
                  <Svg
                    width={shouldShowTwoColumns ? 280 : 220}
                    height={shouldShowTwoColumns ? 280 : 220}
                    style={styles.circularProgressSvg}
                  >
                    {/* Generate 60 tick marks around the circle */}
                    {Array.from({ length: 60 }).map((_, index) => {
                      const svgSize = shouldShowTwoColumns ? 280 : 220;
                      const center = svgSize / 2;
                      const radius = shouldShowTwoColumns ? 135 : 105;
                      const angle = (index * 6 - 90) * (Math.PI / 180);
                      const tickLength = index % 5 === 0 ? 10 : 6;
                      const x1 =
                        center + (radius - tickLength) * Math.cos(angle);
                      const y1 =
                        center + (radius - tickLength) * Math.sin(angle);
                      const x2 = center + radius * Math.cos(angle);
                      const y2 = center + radius * Math.sin(angle);

                      const totalSeconds =
                        currentExercise.duration_seconds || 0;
                      const elapsedSeconds = totalSeconds - timer;
                      const progressPercentage =
                        totalSeconds > 0 ? elapsedSeconds / totalSeconds : 0;
                      const isActive = index / 60 < progressPercentage;

                      return (
                        <Line
                          key={index}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isActive ? "#f59e0b" : "#e5e7eb"}
                          strokeWidth={
                            index % 5 === 0
                              ? shouldShowTwoColumns
                                ? 3.5
                                : 2.5
                              : shouldShowTwoColumns
                                ? 2
                                : 1.5
                          }
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </Svg>
                  <View style={styles.timerTextContainer}>
                    <Text
                      style={[
                        styles.timerText,
                        shouldShowTwoColumns && styles.timerTextGrid,
                      ]}
                    >
                      {formatTime(timer)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <Text style={styles.controlsExerciseName} numberOfLines={1}>
          {currentExercise.details?.name || "Exercise"}
          {currentExercise.sets && currentExercise.sets > 1 && (
            <Text style={styles.setIndicator}>
              {" - Set " + currentSet + "/" + currentExercise.sets}
            </Text>
          )}
        </Text>
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              currentIndex === 0 && styles.controlButtonDisabled,
            ]}
            onPress={handlePrevious}
            disabled={currentIndex === 0}
          >
            <Ionicons
              name="play-back"
              size={28}
              color={currentIndex === 0 ? "#9ca3af" : "#0f766e"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => setIsPaused(!isPaused)}
          >
            <LinearGradient
              colors={
                isPaused ? ["#d97706", "#f59e0b"] : ["#0d9488", "#14b8a6"]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pauseButtonGradient}
            >
              <Ionicons
                name={isPaused ? "play" : "pause"}
                size={30}
                color="#ffffff"
              />
            </LinearGradient>
          </TouchableOpacity>
          {currentIndex === exercises.length - 1 ? (
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleFinish}
            >
              <Ionicons name="checkmark-circle" size={28} color="#0f766e" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.controlButton} onPress={handleNext}>
              <Ionicons name="play-forward" size={28} color="#0f766e" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: "#0f766e",
    fontWeight: "700",
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#0d9488",
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(156,163,175,0.2)",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  closeButton: {
    padding: 4,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f766e",
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
    textAlign: "center",
  },
  placeholder: {
    width: 32,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 999,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  exerciseContentWrapper: {
    width: "100%",
    alignItems: "center",
  },
  exerciseContentWrapperGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },
  leftColumn: {
    width: "100%",
    alignItems: "center",
  },
  leftColumnGrid: {
    flex: 1,
    width: "auto",
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    width: "100%",
    maxWidth: 320,
    aspectRatio: 1,
    borderRadius: 16,
    marginTop: -38,
    overflow: "hidden",
    zIndex: 1,
  },
  imageContainerGrid: {
    marginTop: 12,
    maxWidth: 280,
    width: 280,
    height: 280,
  },
  exerciseImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  restContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 32,
  },
  restTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f766e",
    marginBottom: -8,
  },
  restTimerCircle: {
    position: "relative",
    width: 280,
    height: 280,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },
  restTimerCircleGrid: {
    width: 220,
    height: 220,
  },
  restCircleSvg: {
    position: "absolute",
  },
  restTimerTextContainer: {
    alignItems: "center",
    gap: 4,
    zIndex: 25,
  },
  restTimer: {
    fontSize: 72,
    fontWeight: "800",
    color: "#f59e0b",
    letterSpacing: -2,
  },
  restTimerGrid: {
    fontSize: 56,
  },
  restSubtext: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  restSubtextGrid: {
    fontSize: 13,
  },
  skipRestButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#f59e0b",
    borderRadius: 999,
  },
  skipRestButtonGrid: {
    marginTop: -16,
  },
  skipRestText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
  exerciseName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1f2937",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 12,
  },
  infoTextContainer: {
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 0,
    marginBottom: 4,
    zIndex: 10,
  },
  infoTextContainerGrid: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  infoTextRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  timerContainer: {
    marginTop: -20,
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },
  timerContainerGrid: {
    marginTop: 0,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circularProgressContainer: {
    position: "relative",
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    elevation: 20,
  },
  circularProgressContainerGrid: {
    width: 280,
    height: 280,
  },
  circularProgressSvg: {
    position: "absolute",
  },
  timerTextContainer: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 25,
  },
  timerText: {
    fontSize: 56,
    fontWeight: "800",
    color: "#f59e0b",
    letterSpacing: -2,
  },
  timerTextGrid: {
    fontSize: 68,
  },
  controlsContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(156,163,175,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
    ...(Platform.OS === "web"
      ? ({ boxShadow: "0 -2px 8px rgba(0,0,0,0.1)" } as any)
      : null),
  },
  controlsExerciseName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f766e",
    textAlign: "center",
    marginBottom: 12,
  },
  setIndicator: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 24,
  },
  controlButton: {
    padding: 12,
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
  pauseButton: {
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#0d9488",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  pauseButtonGradient: {
    width: 68,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
  },
});
