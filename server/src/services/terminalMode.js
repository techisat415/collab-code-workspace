export function isRestrictedTerminalMode() {
  return process.env.TERMINAL_MODE === "restricted" ||
    process.env.NODE_ENV === "production";
}
