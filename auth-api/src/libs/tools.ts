import slugify from "slugify";

export const doSlug = (str: string = "") => {
  if (!str) return undefined;
  return slugify(str, {
    lower: true,
    strict: true,
  });
};
