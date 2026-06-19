import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const storiesRouter = Router();

// POST /api/stories
// Record/add a new story to a resident's Life Book
storiesRouter.post("/", async (req, res, next) => {
  try {
    const { 
      lifeBookId, 
      title, 
      audioFileUrl, 
      rawTranscript, 
      literaryContent, 
      durationSeconds 
    } = req.body;

    if (!lifeBookId || !title) {
      res.status(400).json({ error: "Missing required fields: lifeBookId, title" });
      return;
    }

    // Security Check: Verify that the LifeBook belongs to a Resident in the user's CareHome
    const lifeBook = await prisma.lifeBook.findFirst({
      where: {
        id: lifeBookId,
        resident: {
          careHomeId: req.user!.careHomeId,
        },
      },
    });

    if (!lifeBook) {
      res.status(403).json({ error: "Forbidden: LifeBook not found or access denied." });
      return;
    }

    // Create the story with fallback for required schema fields
    const story = await prisma.story.create({
      data: {
        lifeBookId,
        title,
        audioFileUrl: audioFileUrl || "",
        rawTranscript: rawTranscript || "",
        literaryContent: literaryContent || "",
        durationSeconds: durationSeconds || 0,
        recordedById: req.user!.id,
        status: 'ready',
      },
    });

    res.status(201).json({
      data: story,
      error: null,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/stories/:id
// Edit the generated transcript, literary content, or tags of a story
storiesRouter.put("/:id", async (req, res, next) => {
  try {
    const { title, rawTranscript, literaryContent, durationSeconds } = req.body;

    // Security Check: Verify ownership via the nested Resident relationship
    const existing = await prisma.story.findFirst({
      where: {
        id: req.params.id,
        lifeBook: {
          resident: {
            careHomeId: req.user!.careHomeId,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Story not found or access denied." });
      return;
    }

    const updated = await prisma.story.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(rawTranscript !== undefined && { rawTranscript }),
        ...(literaryContent !== undefined && { literaryContent }),
        ...(durationSeconds !== undefined && { durationSeconds }),
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

// DELETE /api/stories/:id
// Delete a specific story from the Life Book
storiesRouter.delete("/:id", async (req, res, next) => {
  try {
    // Security Check: Verify ownership
    const existing = await prisma.story.findFirst({
      where: {
        id: req.params.id,
        lifeBook: {
          resident: {
            careHomeId: req.user!.careHomeId,
          },
        },
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Story not found or access denied." });
      return;
    }

    await prisma.story.delete({
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
