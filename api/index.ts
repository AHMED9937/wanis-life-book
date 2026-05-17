/**
 * Vercel serverless entry — exports the Express app (no app.listen here).
 * Local dev still uses: npm run dev:server
 */
import { app } from "../server/src/app.js";

export default app;
