export type UserAuth = {
  id: string;
  username?: string;
  email?: string;
  phone?: string;
  fbUserId?: string;
  appId: string;
  role: "admin" | "user";
};
