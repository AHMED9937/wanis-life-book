import { Router, Request, Response } from "express";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

export const ttsRouter = Router();

/** Saudi Arabic neural voice (Microsoft Edge TTS). */
const ARABIC_VOICE = "ar-SA-ZariyahNeural";

ttsRouter.post("/", async (req: Request, res: Response) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";

  if (!text) {
    res.status(400).json({ error: "Text is required" });
    return;
  }

  if (text.length > 8000) {
    res.status(400).json({ error: "Text is too long" });
    return;
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(ARABIC_VOICE, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(text);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    audioStream.on("error", (err) => {
      console.error("TTS stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "TTS stream failed" });
      }
    });

    audioStream.pipe(res);
  } catch (error) {
    console.error("TTS error:", error);
    res.status(500).json({
      error: "TTS failed",
      message: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    });
  }
});
