import type { RefreshToken, User } from "@/types";

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
  email?: string;
  phone?: string;
  password?: string;
  refId?: string;
  appId: string;
  role?: string;
  provider?: string;
  otp?: number;
  otpExp?: number;
}): Promise<User> => {
  try {
    const user = await pb.collection("users").create<User>({
      username: userData.username,
      slug: doSlug(userData.username),
      email: userData.email,
      phone: userData.phone,
      password: userData.password || undefined,
      refId: userData.refId || undefined,
      appId: userData.appId,
      role: userData.role || "user",
      provider: userData.provider || undefined,
      otp: userData.otp || undefined,
      otpExp: userData.otpExp || undefined,
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
  email?: string;
  phone?: string;
  password?: string;
  refId?: string;
  appId: string;
  role?: string;
  otp?: number;
  otpExp?: number;
  provider?: string;
}): Promise<User & { wasCreated: boolean; wasConfirmed: boolean }> => {
  try {
    const isEmail = userData.email && userData.email.includes("@");
    const isPhone = userData.phone && userData.phone.startsWith("+");
    const isRefId = userData.refId && !!userData.provider;

    const key = isRefId
      ? userData.refId
      : isEmail
      ? userData.email
      : isPhone
      ? userData.phone
      : userData.username;

    if (!key) {
      throw new Error("Invalid user data");
    }

    console.log("key", key);

    // Try to find existing user by id or refId and appId
    const existingUser = userData.id
      ? await findUserById(userData.id)
      : await findUserByKeyReference(key, userData.appId, userData.provider);

    console.log("existingUser ID", existingUser?.id);
    console.log("userData", userData);

    if (existingUser) {
      // Update existing user
      const user = await pb.collection("users").update<User>(existingUser.id, {
        username: userData.username,
        slug: doSlug(userData.username),
        email: userData.email,
        phone: userData.phone,
        password: userData.password || undefined,
        refId: userData.refId || undefined,
        appId: userData.appId,
        role: userData.role || "user",
        provider: userData.provider || undefined,
        otp: userData.otp || undefined,
        otpExp: userData.otpExp || undefined,
      });
      return { ...user, wasCreated: false, wasConfirmed: !!userData.id };
    } else {
      // Create new user
      const user = await createUser(userData);
      return { ...user, wasCreated: true, wasConfirmed: false };
    }
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
      otp: undefined,
      otpExp: undefined,
    });
  } catch (error) {
    console.error("Error deleting OTP", error);
  }
};
