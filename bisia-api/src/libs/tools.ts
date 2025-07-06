/**
 * Log a message to the console
 * @param message - The message to log
 * @param key - The key to log
 */
export const log = (message: any, key?: string) => {
  if (process.env.NODE_ENV === "development") {
    if (key) {
      console.log(`${key}:`, message);
    } else {
      console.log(message);
    }
  }
};
