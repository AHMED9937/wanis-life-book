import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const meRouter = Router();

// GET /api/me  current user + care home (for onboarding)
meRouter.get("/", async (req, res, next) => {
  try {
    const user = req.user!;
    const careHome = await prisma.careHome.findUnique({
      where: { id: user.careHomeId },
    });

    if (!careHome) {
      res.status(500).json({ error: "Care home not found" });
      return;
    }

    res.json({
      data: {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
        careHome: {
          id: careHome.id,
          name: careHome.name,
          setupCompleted: careHome.setupCompleted,
        },
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/me/care-home  rename facility (onboarding)
meRouter.patch("/care-home", async (req, res, next) => {
  try {
    const { name, contactNumber, address } = req.body as {
      name?: string;
      contactNumber?: string;
      address?: string;
    };

    const trimmedName = typeof name === "string" ? name.trim() : "";
    if (!trimmedName) {
      res.status(400).json({ error: "اسم دار الرعاية مطلوب" });
      return;
    }

    const updated = await prisma.careHome.update({
      where: { id: req.user!.careHomeId },
      data: {
        name: trimmedName,
        ...(typeof contactNumber === "string" && { contactNumber: contactNumber.trim() || "—" }),
        ...(typeof address === "string" && { address: address.trim() || "—" }),
        setupCompleted: true,
      },
    });

    res.json({
      data: {
        id: updated.id,
        name: updated.name,
        setupCompleted: updated.setupCompleted,
      },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});
