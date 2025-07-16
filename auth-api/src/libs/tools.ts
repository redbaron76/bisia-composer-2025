import slugify from "slugify";

export const doSlug = (str: string = "") => {
  if (!str) return undefined;
  return slugify(str, {
    lower: true,
    strict: true,
  });
};

export const generateOtp = (length: number = 6) => {
  return Math.floor(
    10 ** (length - 1) + Math.random() * 9 * 10 ** (length - 1)
  );
};

export const generateOtpExpiration = (minutes: number = 10) => {
  return Date.now() + minutes * 60 * 1000;
};
