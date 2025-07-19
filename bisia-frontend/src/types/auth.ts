export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  OWNER = "owner",
  USER = "user",
}

export type SignupData = {
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiration: number;
  user: User;
};

// Response type that matches the backend response structure
export type AuthResponse = {
  message: string;
  accessToken: string;
  user: User;
  error?: boolean;
};

export type User = {
  id: string;
  username: string;
  slug: string;
  email: string;
  phone: string;
  refId: string;
  role: Role;
  provider: string;
  appId: string;
  wasCreated: boolean;
  wasConfirmed: boolean;
};

export type CreateUser = Omit<User, "id" | "created" | "updated">;
export type UpdateUser = Omit<User, "created" | "updated"> & { id?: string };

export type CheckUsername = {
  error: boolean;
  message?: string;
};

export type DeleteUser = {
  success: boolean;
  userId: string;
  refId?: string;
};

export type RefreshToken = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiration: number;
};

export type ConfirmOtp = {
  success: boolean;
  userId: string;
  refId?: string;
};

export type EmailSignin = {
  otpExp: number;
  refId: string;
};

export type OtpResponse = {
  userId: string;
  error?: boolean;
  message?: string;
};

// Legacy types for backward compatibility
export type UserAuth = {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  fbUserId?: string;
  appId: string;
  role: "admin" | "user";
};

export type LoginResponse = {
  error: boolean;
  accessToken: string;
  user: UserAuth;
  message?: string;
};

export type OtpConfirmation = {
  otp: string;
  email?: string;
  phone?: string;
  username?: string;
};

export type ApiResponse = {
  error: boolean;
  message?: string;
};
