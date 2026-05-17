import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

type NodeEnv = "development" | "production" | "test";

type Env = {
  DATABASE_URL: string;
  PORT: number;
  NODE_ENV: NodeEnv;
  CLERK_SECRET_KEY: string;
  CLERK_PUBLISHABLE_KEY: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootEnvPath = resolve(__dirname, "../../../.env");

dotenv.config({ path: rootEnvPath });

const parsePort = (rawPort: string | undefined): number => {
  if (!rawPort || rawPort.trim() === "") {
    return 4000;
  }

  const parsed = Number.parseInt(rawPort, 10);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("Invalid PORT. It must be an integer between 1 and 65535.");
  }
  return parsed;
};

const parseNodeEnv = (rawNodeEnv: string | undefined): NodeEnv => {
  const value = rawNodeEnv ?? "development";
  if (value === "development" || value === "production" || value === "test") {
    return value;
  }
  throw new Error(
    `Invalid NODE_ENV "${value}". Allowed values: development, production, test.`,
  );
};

const parseDatabaseUrl = (rawUrl: string | undefined): string => {
  if (!rawUrl || rawUrl.trim() === "") {
    throw new Error("Missing required environment variable: DATABASE_URL.");
  }

  try {
    new URL(rawUrl);
  } catch {
    throw new Error("Invalid DATABASE_URL. Expected a valid connection URL.");
  }

  return rawUrl;
};

const parseClerkKey = (keyName: string, rawKey: string | undefined): string => {
  if (!rawKey || rawKey.trim() === "") {
    throw new Error(`Missing required environment variable: ${keyName}.`);
  }
  return rawKey;
};

const buildEnv = (): Env => {
  try {
    return {
      DATABASE_URL: parseDatabaseUrl(process.env.DATABASE_URL),
      PORT: parsePort(process.env.PORT),
      NODE_ENV: parseNodeEnv(process.env.NODE_ENV),
      CLERK_SECRET_KEY: parseClerkKey("CLERK_SECRET_KEY", process.env.CLERK_SECRET_KEY),
      CLERK_PUBLISHABLE_KEY: parseClerkKey("CLERK_PUBLISHABLE_KEY", process.env.CLERK_PUBLISHABLE_KEY),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown env error.";
    throw new Error(`Environment validation failed: ${message}`);
  }
};

export const env = buildEnv();
