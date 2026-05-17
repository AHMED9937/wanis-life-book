import { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      auth?: {
        userId: string;
        sessionId: string;
        getToken: (options?: any) => Promise<string | null>;
        claims: Record<string, any>;
      };
    }
  }
}
