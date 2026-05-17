import { Request, Response, NextFunction } from "express";
import { clerkMiddleware, getAuth, clerkClient } from "@clerk/express";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";

// Export the Clerk middleware to be used in the app
export const clerkAuth = clerkMiddleware({
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
});

// Protect route middleware using the recommended getAuth() approach
export const protectRoute = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  if (!auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
};

// Custom middleware to resolve and inject the Prisma User into req.user
export const resolveTenant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
   const auth = getAuth(req);
const clerkId = auth.userId;

    if (!clerkId) {
      // If there's no clerkId, they aren't authenticated (should be caught by protectRoute first)
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // Try to find the user in our database
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // Upsert logic if the user doesn't exist in our DB yet
    if (!user) {
      // Fetch details from Clerk
      
      const clerkUser = await clerkClient.users.getUser(clerkId);
      
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const fullName = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
      const avatarUrl = clerkUser.imageUrl;

      // Each account gets its own care home — never share "Unassigned" across users
      const careHomeName =
        fullName && fullName !== "Unknown User"
          ? `دار ${fullName}`
          : email
            ? `دار ${email.split("@")[0]}`
            : "دار الرعاية";

      const personalCareHome = await prisma.careHome.create({
        data: {
          name: careHomeName,
          contactNumber: "—",
          address: "—",
          setupCompleted: false,
        },
      });

      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          fullName: fullName || "Unknown User",
          avatarUrl,
          role: "caregiver",
          careHomeId: personalCareHome.id,
        },
      });
    }

    // Inject the user into the request context
    req.user = user;
    
    next();
  } catch (error) {
    console.error("Error in resolveTenant middleware:", error);
    res.status(500).json({ error: "Internal Server Error during authentication" });
  }
};
