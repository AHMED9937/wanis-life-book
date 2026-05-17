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

      // Handle the CareHome requirement
      // We will create/find a default "Unassigned" CareHome for new users
      let defaultCareHome = await prisma.careHome.findFirst({
        where: { name: "Unassigned" },
      });

      if (!defaultCareHome) {
        defaultCareHome = await prisma.careHome.create({
          data: {
            name: "Unassigned",
            contactNumber: "0000000000",
            address: "System Default",
          },
        });
      }

      // Create the user in our database
      user = await prisma.user.create({
        data: {
          clerkId,
          email,
          fullName: fullName || "Unknown User",
          avatarUrl,
          role: "caregiver", // Default role
          careHomeId: defaultCareHome.id,
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
