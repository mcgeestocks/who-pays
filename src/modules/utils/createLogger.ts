type LogLevel = "debug" | "info" | "warn" | "error";

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isEnabled =
  import.meta.env.DEV || localStorage.getItem("debug") === "true";

function formatTimestamp(): string {
  const now = new Date();
  return now.toISOString().slice(11, 23); // HH:mm:ss.SSS
}

export function createLogger(
  namespace: string,
  minLevel: LogLevel = "debug"
): Logger {
  const minLevelValue = LOG_LEVELS[minLevel];

  const log = (level: LogLevel, ...args: unknown[]): void => {
    if (!isEnabled || LOG_LEVELS[level] < minLevelValue) return;

    const timestamp = formatTimestamp();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${namespace}]`;

    switch (level) {
      case "debug":
        console.log(prefix, ...args);
        break;
      case "info":
        console.info(prefix, ...args);
        break;
      case "warn":
        console.warn(prefix, ...args);
        break;
      case "error":
        console.error(prefix, ...args);
        break;
    }
  };

  return {
    debug: (...args: unknown[]) => log("debug", ...args),
    info: (...args: unknown[]) => log("info", ...args),
    warn: (...args: unknown[]) => log("warn", ...args),
    error: (...args: unknown[]) => log("error", ...args),
  };
}
