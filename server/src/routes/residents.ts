import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { residentMatchesQuery } from "../lib/search.js";

export const residentsRouter = Router();

// GET /api/residents
// Fetch all residents for the current user's care home
residentsRouter.get("/", async (req, res, next) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";

    const baseWhere = { careHomeId: req.user!.careHomeId };

  const include = {
    lifeBook: {
      include: { stories: true },
    },
  };

  let residents;

  if (q.length > 0) {
    // Normalize match in app code (fixes 104 vs ١٠٤, name, nickname, room, book title)
    const allForHome = await prisma.resident.findMany({
      where: baseWhere,
      include,
      orderBy: { createdAt: "desc" },
    });
    residents = allForHome.filter((r) => residentMatchesQuery(r, q));
  } else {
    residents = await prisma.resident.findMany({
      where: baseWhere,
      include,
      orderBy: { createdAt: "desc" },
    });
  }

    res.json({
      data: residents,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/residents/:id
// Fetch a single resident by ID
residentsRouter.get("/:id", async (req, res, next) => {
  try {
    const resident = await prisma.resident.findUnique({
      where: { 
        id: req.params.id, 
        careHomeId: req.user!.careHomeId 
      },
      include: { 
        lifeBook: { 
          include: { stories: true } 
        } 
      },
    });

    if (!resident) {
      res.status(404).json({ error: "Resident not found" });
      return;
    }

    res.json({
      data: resident,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/residents
// Create a new resident and automatically initialize their 1:1 LifeBook
residentsRouter.post("/", async (req, res, next) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, roomNumber } = req.body;

    if (!firstName || !lastName || !gender) {
      res.status(400).json({ error: "Missing required fields: firstName, lastName, gender" });
      return;
    }

    const resident = await prisma.resident.create({
      data: {
        firstName,
        lastName,
        gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        roomNumber,
        careHomeId: req.user!.careHomeId,
        createdById: req.user!.id,
        lifeBook: {
          create: {
            bookTitle: `كتاب حياة ${firstName}`,
            coverStyle: "classic_leather",
          },
        },
      },
      include: {
        lifeBook: true,
      },
    });

    res.status(201).json({
      data: resident,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/residents/:id
// Update a resident's details
residentsRouter.put("/:id", async (req, res, next) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, roomNumber } = req.body;

    // First ensure the resident belongs to the user's care home
    const existing = await prisma.resident.findUnique({
      where: { id: req.params.id, careHomeId: req.user!.careHomeId },
    });

    if (!existing) {
      res.status(404).json({ error: "Resident not found" });
      return;
    }

    const updated = await prisma.resident.update({
      where: { id: req.params.id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(gender && { gender }),
        ...(dateOfBirth !== undefined && { dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null }),
        ...(roomNumber !== undefined && { roomNumber }),
      },
    });

    res.json({
      data: updated,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/residents/:id
// Remove a resident and all cascading data
residentsRouter.delete("/:id", async (req, res, next) => {
  try {
    // Check ownership
    const existing = await prisma.resident.findUnique({
      where: { id: req.params.id, careHomeId: req.user!.careHomeId },
    });

    if (!existing) {
      res.status(404).json({ error: "Resident not found" });
      return;
    }

    await prisma.resident.delete({
      where: { id: req.params.id },
    });

    res.json({
      data: { success: true },
      error: null,
    });
  } catch (error) {
    next(error);
  }
});
