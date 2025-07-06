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
};

export type SignupData = {
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiration: number;
  user: SignupUser;
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

export type CheckUsernamePhone = {
  ok: boolean;
  error?: string;
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
