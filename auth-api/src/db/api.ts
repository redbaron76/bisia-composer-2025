import type { RefreshToken, Role, User } from "@/types";

import { doSlug } from "@/libs/tools";
import { pb } from "@/db/conn";

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
 * Find a user by email or username and appId
 * @param key - The key of the user (email or username or phone)
 * @param appId - The appId of the user
 * @param provider - The provider of the user
 * @returns The user or null if not found
 */
export const findUserByKeyReference = async (
  key: string, // email | username | phone | refId
  appId: string,
  provider?: string
): Promise<User | null> => {
  if (!provider) provider = "";
  const isEmail = key.includes("@") && key.includes(".");
  const isPhone = key.startsWith("+");
  const isRefId = !!provider && provider !== "email";
  const isUsername = !isEmail && !isPhone && !isRefId;

  if (isUsername) key = doSlug(key) as string;

  try {
    let filterKey = "slug"; // default filter key
    if (isEmail) filterKey = "email";
    if (isPhone) filterKey = "phone";
    if (isRefId) filterKey = "refId";

    console.log("filterKey", filterKey);
    console.log("key", key);
    console.log("appId", appId);
    console.log("provider", provider);

    let filter = `(${filterKey}="${key}") && appId="${appId}"`;

    // If searching for email or phone, also check tmpField
    if (isEmail || isPhone) {
      filter = `((${filterKey}="${key}" || tmpField="${key}")) && appId="${appId}"`;
    }

    if (isRefId) {
      filter += ` && provider="${provider}"`;
    }

    console.log("filter", filter);

    const user = await pb.collection("users").getFirstListItem<User>(filter);

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
 * Save a refresh token
 * @param userId - The id of the user
 * @param token - The token to save
 * @param appId - The appId of the user
 * @param expiresInDays - The number of days the token is valid
 */
export const saveRefreshToken = async (
  userId: string,
  token: string,
  appId: string,
  expiresInDays: number
): Promise<void> => {
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  await pb.collection("refresh_tokens").create<RefreshToken>({
    userId,
    token,
    appId,
    expiresAt,
  });
};

/**
 * Find a refresh token
 * @param token - The token to find
 * @param appId - The appId of the user
 * @returns The refresh token or null if not found
 */
export const findRefreshToken = async (
  token: string,
  appId: string
): Promise<RefreshToken | null> => {
  try {
    const refreshToken = await pb
      .collection("refresh_tokens")
      .getFirstListItem<RefreshToken>(`token="${token}" && appId="${appId}"`);

    // If the refresh token is expired, return null
    if (refreshToken.expiresAt < Date.now()) return null;

    // Return the refresh token
    return {
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      appId: refreshToken.appId,
      expiresAt: refreshToken.expiresAt,
    };
  } catch {
    return null;
  }
};

/**
 * Find a refresh token by user id
 * @param userId - The id of the user
 * @param appId - The appId of the user
 * @returns The refresh token or null if not found
 */
export const findRefreshTokenByUserId = async (
  userId: string,
  appId: string
): Promise<RefreshToken | null> => {
  try {
    const refreshToken = await pb
      .collection("refresh_tokens")
      .getFirstListItem<RefreshToken>(`userId="${userId}" && appId="${appId}"`);

    // If the refresh token is expired, return null
    if (refreshToken.expiresAt < Date.now()) return null;

    // Return the refresh token
    return {
      id: refreshToken.id,
      userId: refreshToken.userId,
      token: refreshToken.token,
      appId: refreshToken.appId,
      expiresAt: refreshToken.expiresAt,
    };
  } catch {
    return null;
  }
};

/**
 * Delete a refresh token
 * @param token - The token to delete
 * @param appId - The appId of the user
 */
export const deleteRefreshToken = async (
  token: string,
  appId: string
): Promise<void> => {
  try {
    const refreshToken = await pb
      .collection("refresh_tokens")
      .getFirstListItem<RefreshToken>(`token="${token}" && appId="${appId}"`);

    // If the refresh token is not found, return
    if (!refreshToken) return;

    console.log("deleteRefreshToken", token, refreshToken.id);

    // Delete the refresh token
    await pb.collection("refresh_tokens").delete(refreshToken.id);
  } catch {
    return;
  }
};

/**
 * Delete a refresh token by user id
 * @param userId - The id of the user
 * @param appId - The appId of the user
 */
export const deleteRefreshTokenByUserId = async (
  userId: string,
  appId: string
): Promise<void> => {
  try {
    const refreshToken = await pb
      .collection("refresh_tokens")
      .getFirstListItem<RefreshToken>(`userId="${userId}" && appId="${appId}"`);

    // If the refresh token is not found, return
    if (!refreshToken) return;

    console.log("deleteRefreshTokenByUserId", userId, refreshToken.id);

    // Delete the refresh token
    await pb.collection("refresh_tokens").delete(refreshToken.id);
  } catch {
    return;
  }
};

/**
 * Create a new user
 * @param userData - The user data to create
 * @returns The created user
 */
export const createUser = async (userData: {
  username?: string;
  slug?: string;
  email?: string;
  phone?: string;
  password?: string;
  refId?: string;
  picture?: string;
  appId: string;
  role?: string;
  provider?: string;
  otp?: number;
  otpExp?: number;
  tmpField?: string;
}): Promise<User> => {
  try {
    const user = await pb.collection("users").create<User>({
      username: userData.username,
      slug: userData.slug,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      refId: userData.refId,
      picture: userData.picture,
      appId: userData.appId,
      role: userData.role || "user",
      provider: userData.provider,
      otp: userData.otp,
      otpExp: userData.otpExp,
      tmpField: userData.tmpField,
    });
    return user;
  } catch (error) {
    console.error("Error creating user", error);
    throw error;
  }
};

export const upsertUser = async (userData: {
  id?: string;
  username?: string;
  slug?: string;
  email?: string;
  phone?: string;
  password?: string;
  refId?: string;
  picture?: string;
  appId: string;
  role?: string;
  otp?: number;
  otpExp?: number;
  provider?: string;
  tmpField?: string;
}): Promise<User & { wasCreated: boolean; wasConfirmed: boolean }> => {
  try {
    // If no id is provided, create a new user with all required data
    if (!userData.id) {
      // Validate that all required fields are present for creation
      if (!userData.username || !userData.appId) {
        throw new Error("Username and appId are required for user creation");
      }

      const user = await createUser({
        username: userData.username,
        slug: userData.slug,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        refId: userData.refId,
        picture: userData.picture,
        appId: userData.appId,
        role: userData.role,
        provider: userData.provider,
        otp: userData.otp,
        otpExp: userData.otpExp,
        tmpField: userData.tmpField,
      });

      return { ...user, wasCreated: true, wasConfirmed: false };
    }

    // If id is provided, try to update existing user or create new one
    const existingUser = await findUserById(userData.id);

    if (!existingUser) {
      // User not found, create new user with the provided id
      if (!userData.username || !userData.appId) {
        throw new Error("Username and appId are required for user creation");
      }

      const user = await pb.collection("users").create<User>({
        id: userData.id,
        username: userData.username,
        slug: userData.slug || doSlug(userData.username),
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        refId: userData.refId,
        appId: userData.appId,
        role: userData.role || "user",
        provider: userData.provider,
        otp: userData.otp,
        otpExp: userData.otpExp,
        tmpField: userData.tmpField,
      });

      return { ...user, wasCreated: true, wasConfirmed: false };
    }

    // Build update object with only provided fields
    const updateData: Partial<User> = {};

    if (userData.username !== undefined) {
      updateData.username = userData.username;
      updateData.slug = userData.slug || doSlug(userData.username);
    }
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.phone !== undefined) updateData.phone = userData.phone;
    if (userData.password !== undefined)
      updateData.password = userData.password;
    if (userData.refId !== undefined) updateData.refId = userData.refId;
    if (userData.appId !== undefined) updateData.appId = userData.appId;
    if (userData.role !== undefined) updateData.role = userData.role as Role;
    if (userData.provider !== undefined)
      updateData.provider = userData.provider;
    if (userData.otp !== undefined) updateData.otp = userData.otp;
    if (userData.otpExp !== undefined) updateData.otpExp = userData.otpExp;
    if (userData.tmpField !== undefined)
      updateData.tmpField = userData.tmpField;

    const user = await pb
      .collection("users")
      .update<User>(userData.id, updateData);
    return { ...user, wasCreated: false, wasConfirmed: true };
  } catch (error) {
    console.error("Error upserting user", error);
    throw error;
  }
};

/**
 * Check if an app is authorized
 * @param appId - The appId to check
 * @returns true if the app is authorized, false otherwise
 */
export const checkIsAppAuthorized = async (appId: string): Promise<boolean> => {
  try {
    await pb.collection("auth_apps").getFirstListItem(`appId="${appId}"`);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if a username is available
 * @param username - The username to check
 * @param appId - The appId of the user
 * @returns true if the username is available, false otherwise
 */
export const checkIsUsernameAvailable = async (
  username: string,
  appId: string
): Promise<boolean> => {
  // not checking username
  if (!username) return true;
  // get slug from username
  const slug = doSlug(username);

  try {
    await pb
      .collection("users")
      .getFirstListItem(`slug="${slug}" && appId="${appId}"`);
    return false;
  } catch {
    return true;
  }
};

/**
 * Get the app options
 * @returns The app options
 */
export const getAppOptions = async (): Promise<
  {
    appId: string;
    revocable: boolean;
    accessTokenMinutesExp: number;
    refreshTokenDaysExp: number;
  }[]
> => {
  try {
    const apps = await pb.collection("auth_apps").getFullList();
    return apps.map(
      ({
        appId,
        revocable,
        access_token_exp_mins,
        refresh_token_exp_days,
      }) => ({
        appId,
        revocable,
        accessTokenMinutesExp: access_token_exp_mins,
        refreshTokenDaysExp: refresh_token_exp_days,
      })
    );
  } catch (error) {
    console.log("Errore nel caricamento degli origins:", error);
    return [];
  }
};

/**
 * Delete expired OTPs
 * @returns void
 */
export const deteleExpiredOtp = async (): Promise<void> => {
  try {
    const users = await pb.collection("users").getFullList<User>({
      filter: `otpExp < ${Date.now()}`,
    });
    for (const user of users) {
      await deleteOtp(user.id);
    }
  } catch (error) {
    console.error("Error deleting expired OTPs", error);
  }
};

/**
 * Delete the OTP of a user
 * @param userId - The id of the user
 * @returns void
 */
export const deleteOtp = async (userId: string): Promise<void> => {
  try {
    await pb.collection("users").update<User>(userId, {
      otp: null,
      otpExp: null,
      tmpField: null,
    });
  } catch (error) {
    console.error("Error deleting OTP", error);
  }
};

/**
 * Clear temporary fields and OTP after successful confirmation
 * @param userId - The id of the user
 * @param appId - The appId of the user
 * @returns void
 */
export const clearTemporaryFields = async (userId: string): Promise<void> => {
  try {
    // Try with empty strings first, if that doesn't work, we'll try removing the fields
    await pb.collection("users").update<User>(userId, {
      otp: "",
      otpExp: "",
      tmpField: "",
    });
    console.log("Temporary fields cleared for user:", userId);
  } catch (error) {
    console.error("Error clearing temporary fields", error);
    // If the above fails, try with null values
    try {
      await pb.collection("users").update<User>(userId, {
        otp: null,
        otpExp: null,
        tmpField: null,
      });
      console.log(
        "Temporary fields cleared with null values for user:",
        userId
      );
    } catch (nullError) {
      console.error("Error clearing temporary fields with null:", nullError);
    }
  }
};
