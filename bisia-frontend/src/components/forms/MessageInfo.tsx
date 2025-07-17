import { useAuthStore } from "@/stores/AuthStore";
import { useShallow } from "zustand/react/shallow";

const MessageInfo = () => {
  const { message, error } = useAuthStore(
    useShallow((state) => ({
      message: state.message,
      error: state.error,
    }))
  );

  if (!message) return null;

  return (
    <div className={`${error ? "text-red-500" : "text-green-500"}`}>
      {message}
    </div>
  );
};

export default MessageInfo;
