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
export const upsertProfile = async (
  profileData: Profile,
  forceCreate: boolean = false
) => {
  try {
    const existingProfile = profileData.id
      ? await pb.collection("profiles").getOne(profileData.id)
      : null;

    if (existingProfile) {
      const profile = await pb
        .collection("profiles")
        .update(existingProfile.id, {
          ...profileData,
        });
      return { ...profile, wasCreated: false };
    } else {
      const profile = await createProfile(profileData);
      return { ...profile, wasCreated: true };
    }
  } catch (error) {
    console.error("Error upserting profile", error);
    throw error;
  }
};
