import PocketBase from "pocketbase";
import { env } from "@/env";

export const pb = new PocketBase(env.BISIA_BASE_URL);
