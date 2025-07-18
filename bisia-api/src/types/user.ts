export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  OWNER = "owner",
  USER = "user",
}

export type SignupUser = {
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

export type SignupData = {
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiration: number;
  user: SignupUser;
  error?: string;
};

export type User = {
  id: string;
  refId?: string;
  username: string;
  slug: string;
  phone?: string;
  email?: string;
  role: Role;
  isDisabled: boolean;
  created: string;
  updated: string;
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
  success: boolean;
  userId: string;
  error?: string;
};
