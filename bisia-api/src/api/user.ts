import type { CreateUser, UpdateUser, User } from "@/types/user";

import { createProfile } from "./profile";
import { pb } from "@/libs/db";

/**
 * Find a user by id
 * @param userId - The id of the user
 * @returns The user or null if not found
 */
export const findUserById = async (userId: string): Promise<User | null> => {
  try {
    const user = await pb
      .collection("users")
      .getFirstListItem<User>(`id="${userId}"`);
    return user;
  } catch {
    return null;
  }
};

/**
 * Delete a user by id
 * @param userId - The id of the user
 * @returns True if the user was deleted, false otherwise
 */
export const deleteUserById = async (userId: string): Promise<boolean> => {
  try {
    return await pb.collection("users").delete(userId);
  } catch {
    return false;
  }
};

/**
 * Create a new user
 * @param userData - The user data to create
 * @returns The created user
 */
export const createUser = async (userData: CreateUser): Promise<User> => {
  try {
    const user = await pb.collection("users").create<User>({
      ...userData,
      role: userData.role || "user",
      isDisabled: false,
    });
    return user;
  } catch (error) {
    console.error(
      "Error creating user",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};

export const upsertUser = async (
  userData: UpdateUser,
  forceCreate: boolean = false
): Promise<User & { wasCreated: boolean }> => {
  try {
    console.log("forceCreate", forceCreate);

    // If forceCreate is true and userData.id is provided, create a new user with the provided data
    if (forceCreate && userData.id) {
      // create first the user
      const user = await createUser(userData);
      // create the profile
      await createProfile({
        id: user.id,
        userId: user.id,
      });
      return { ...user, wasCreated: true };
    }

    // Try to find existing user by userId
    const existingUser = userData.id ? await findUserById(userData.id) : null;

    if (existingUser) {
      // Update existing user
      const user = await pb.collection("users").update<User>(existingUser.id, {
        ...userData,
      });
      return { ...user, wasCreated: false };
    } else {
      // Create new user
      const user = await createUser(userData);
      return { ...user, wasCreated: true };
    }
  } catch (error) {
    console.error(
      "Error upserting user",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};
