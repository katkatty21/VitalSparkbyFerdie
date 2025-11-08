// ===========================
// Muscular Diagram Images
// ===========================
// This file preloads and exports all muscle group diagram images
// organized by gender for easy access in components

export type MuscleGroup =
    | "arms"
    | "back"
    | "chest"
    | "core"
    | "full_body"
    | "glutes"
    | "leg"
    | "lower_body"
    | "muscular_body"
    | "shoulder"
    | "upper_body";

export type Gender = "male" | "female";

// Male muscle group diagrams
export const maleMuscularDiagrams = {
    arms: require("./male/male_arms_diagram.png"),
    back: require("./male/male_back_diagram.png"),
    chest: require("./male/male_chest_diagram.png"),
    core: require("./male/male_core_diagram.png"),
    full_body: require("./male/male_full_body_diagram.png"),
    glutes: require("./male/male_glutes_diagram.png"),
    leg: require("./male/male_leg_diagram.png"),
    lower_body: require("./male/male_lower_body_diagram.png"),
    muscular_body: require("./male/male_muscular_body_diagram.png"),
    shoulder: require("./male/male_shoulder_diagram.png"),
    upper_body: require("./male/male_upper_body_diagram.png"),
};

// Female muscle group diagrams
export const femaleMuscularDiagrams = {
    arms: require("./female/female_arms_diagram.png"),
    back: require("./female/female_back_diagram.png"),
    chest: require("./female/female_chest_diagram.png"),
    core: require("./female/female_core_diagram.png"),
    full_body: require("./female/female_full_body_diagram.png"),
    glutes: require("./female/female_glutes_diagram.png"),
    leg: require("./female/female_leg_diagram.png"),
    lower_body: require("./female/female_lower_body_diagram.png"),
    muscular_body: require("./female/female_muscular_body_diagram.png"),
    shoulder: require("./female/female_shoulder_diagram.png"),
    upper_body: require("./female/female_upper_body_diagram.png"),
};

// Combined diagrams object organized by gender
export const muscularDiagrams = {
    male: maleMuscularDiagrams,
    female: femaleMuscularDiagrams,
};

/**
 * Get muscle group diagram based on gender and muscle group
 * @param gender - User's gender ("male" or "female")
 * @param muscleGroup - Target muscle group
 * @returns Image source for the specified muscle group diagram
 */
export const getMuscularDiagram = (
    gender: Gender,
    muscleGroup: MuscleGroup
) => {
    return muscularDiagrams[gender][muscleGroup];
};

/**
 * Get all muscle group diagrams for a specific gender
 * @param gender - User's gender ("male" or "female")
 * @returns Object containing all muscle group diagrams for the specified gender
 */
export const getMuscularDiagramsByGender = (gender: Gender) => {
    return muscularDiagrams[gender];
};

/**
 * Get available muscle group keys
 * @returns Array of available muscle group identifiers
 */
export const getAvailableMuscleGroups = (): MuscleGroup[] => {
    return [
        "arms",
        "back",
        "chest",
        "core",
        "full_body",
        "glutes",
        "leg",
        "lower_body",
        "muscular_body",
        "shoulder",
        "upper_body",
    ];
};

// Default export for convenience
export default muscularDiagrams;

