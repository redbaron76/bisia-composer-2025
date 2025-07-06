export enum Role {
  ADMIN = "admin",
  MANAGER = "manager",
  OWNER = "owner",
  USER = "user",
}

// Base interface with optional fields
interface UserBase {
  id: string;
  password: string; // Hash in produzione
  role: Role;
  refId?: string; // id utente di FireBase
  appId: string; // Identificativo dell'applicativo
}

// Interface that requires at least one of username (and slug) or email or phone
export type User = UserBase &
  (
    | { username: string; slug: string; email?: string; phone?: string }
    | { username?: string; slug?: string; email: string; phone?: string }
    | { username: string; slug: string; email: string; phone?: string }
    | { username: string; slug: string; email?: string; phone: string }
    | { username?: string; slug?: string; email: string; phone: string }
    | { username: string; slug: string; email: string; phone: string }
  );

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: number;
  appId: string;
}

export interface JwtPayload {
  userId: string;
  role: string;
  appId: string; // Aggiunto per differenziare l'applicativo
}

export interface ReturnTokenGeneration {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiration: number;
}

export type SignupUser = {
  id?: string;
  username?: string;
  slug?: string;
  email?: string;
  phone?: string;
  role: Role;
  refId?: string;
  appId: string;
  wasCreated: boolean;
};

export type SignupData = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiration: number;
  user: SignupUser;
};

// definisco le variabili globali per l'app
export type Variables = {
  revocable: boolean;
  accessTokenMinutesExp: number;
  refreshTokenDaysExp: number;
  jwtPayload: JwtPayload;
  userId?: string;
};

// definisco le opzioni dell'app
export type AppOptions = {
  revocable: boolean;
  accessTokenMinutesExp: number;
  refreshTokenDaysExp: number;
};
