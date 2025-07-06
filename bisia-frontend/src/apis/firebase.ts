import { auth } from "@/lib/firebase";
import { deleteUser } from "firebase/auth";

export const deleteFirebaseUser = async () => {
  const fbUser = auth.currentUser;
  if (fbUser) {
    await deleteUser(fbUser);
  }
};
