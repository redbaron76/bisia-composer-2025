import type { Profile } from "@/types/profile";
import { pb } from "@/libs/db";

/**
 * Create a new profile
 * @param profileData - The profile data to create
 * @returns The created profile
 */
export const createProfile = async (profileData: Partial<Profile>) => {
  try {
    const profile = await pb.collection("profiles").create({
      ...profileData,
    });
    return profile;
  } catch (error) {
    console.error("Error creating profile", error);
    throw error;
  }
};

/**
 * Upsert a profile
 * @param profileData - The profile data to upsert
 * @returns The upserted profile
 */
export const upsertProfile = async (profileData: Partial<Profile>) => {
  try {
    // If we have an ID, try to find existing profile
    if (profileData.id) {
      try {
        const existingProfile = await pb
          .collection("profiles")
          .getOne(profileData.id);

        if (existingProfile) {
          // Update existing profile
          const profile = await pb
            .collection("profiles")
            .update(existingProfile.id, {
              ...profileData,
            });
          return { ...profile, wasCreated: false };
        }
      } catch (error) {
        // Profile not found, will create new one with specified ID
        console.log(
          "Profile not found, creating new one with ID:",
          profileData.id
        );
      }
    }

    // Create new profile (with specified ID if provided)
    const profile = await createProfile(profileData);
    return { ...profile, wasCreated: true };
  } catch (error) {
    console.error("Error upserting profile", error);
    throw error;
  }
};
