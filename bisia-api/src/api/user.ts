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
  userData: Partial<UpdateUser>
): Promise<User & { wasCreated: boolean }> => {
  console.log("userData!!", userData);
  try {
    // Validate that at least one of email or phone is present
    const hasEmailOrPhone = userData.email || userData.phone;
    const hasUsername = userData.username;

    console.log("hasUsername", hasUsername);
    console.log("hasEmailOrPhone", hasEmailOrPhone);

    // If no id is provided, create a new user with all required data
    if (!userData.id) {
      // must have username and one of email or phone
      if (!hasUsername || !hasEmailOrPhone) {
        throw new Error(
          "Username e e-mail o numero di telefono sono obbligatori"
        );
      }

      const user = await createUser(userData as CreateUser);
      return { ...user, wasCreated: true };
    }

    // If id is provided, try to update existing user or create new one
    const existingUser = await findUserById(userData.id);

    if (!existingUser) {
      // User not found, create new user with the provided id
      if (!hasUsername || !hasEmailOrPhone) {
        throw new Error(
          "Username e e-mail o numero di telefono sono obbligatori"
        );
      }

      const user = await pb.collection("users").create<User>({
        id: userData.id,
        ...userData,
        role: userData.role || "user",
        isDisabled: false,
      });

      return { ...user, wasCreated: true };
    }

    // Build update object with only provided fields
    const updateData: Partial<User> = {};

    if (userData.username !== undefined)
      updateData.username = userData.username;
    if (userData.slug !== undefined) updateData.slug = userData.slug;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.refId !== undefined) updateData.refId = userData.refId;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.isDisabled !== undefined)
      updateData.isDisabled = userData.isDisabled;

    const user = await pb
      .collection("users")
      .update<User>(userData.id, updateData);
    return { ...user, wasCreated: false };
  } catch (error) {
    console.error(
      "Error upserting user",
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
};
