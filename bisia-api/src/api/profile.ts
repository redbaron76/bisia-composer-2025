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
    // If no id is provided, create a new profile
    if (!profileData.id) {
      const profile = await createProfile(profileData);
      return { ...profile, wasCreated: true };
    }

    // If id is provided, try to update existing profile or create new one
    try {
      const existingProfile = await pb
        .collection("profiles")
        .getOne(profileData.id);

      if (existingProfile) {
        // Build update object with only provided fields
        const updateData: Partial<Profile> = {};

        if (profileData.userId !== undefined)
          updateData.userId = profileData.userId;
        if (profileData.bio !== undefined) updateData.bio = profileData.bio;
        if (profileData.hometown !== undefined)
          updateData.hometown = profileData.hometown;
        if (profileData.birthdate !== undefined)
          updateData.birthdate = profileData.birthdate;
        if (profileData.birthday !== undefined)
          updateData.birthday = profileData.birthday;
        if (profileData.avatar !== undefined)
          updateData.avatar = profileData.avatar;
        if (profileData.love !== undefined) updateData.love = profileData.love;
        if (profileData.gender !== undefined)
          updateData.gender = profileData.gender;
        if (profileData.questions !== undefined)
          updateData.questions = profileData.questions;
        if (profileData.lovehate !== undefined)
          updateData.lovehate = profileData.lovehate;

        const profile = await pb
          .collection("profiles")
          .update(existingProfile.id, updateData);
        return { ...profile, wasCreated: false };
      }
    } catch (error) {
      // Profile not found, will create new one with specified ID
      console.log(
        "Profile not found, creating new one with ID:",
        profileData.id
      );
    }

    // Create new profile with the provided id
    const profile = await pb.collection("profiles").create({
      id: profileData.id,
      ...profileData,
    });
    return { ...profile, wasCreated: true };
  } catch (error) {
    console.error("Error upserting profile", error);
    throw error;
  }
};
