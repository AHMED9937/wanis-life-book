import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      auth?: {
        userId: string;
        sessionId: string;
        getToken: (options?: Record<string, unknown>) => Promise<string | null>;
        claims: Record<string, unknown>;
      };
    }
  }
}

export {};
