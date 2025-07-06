export enum Love {
  GREEN = "green",
  YELLOW = "yellow",
  RED = "red",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  UNDEFINED = "undefined",
}

export type Profile = {
  id: string;
  userId: string;
  bio: string;
  hometown: string;
  birthdate: Date;
  birthday: string;
  avatar: string;
  love: Love;
  gender: Gender;
  questions: Record<string, string>;
  lovehate: Record<string, string>;
  created: string;
  updated: string;
};
