import { ClerkProvider } from "@clerk/clerk-react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {clerkPubKey ? (
      <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <div className="wood-desk min-h-screen flex items-center justify-center p-6">
        <div className="bg-[#f4ecd8] rounded-xl p-6 shadow-2xl border-2 border-[#c9a84c] max-w-lg w-full">
          <h1 className="text-2xl font-amiri font-bold text-[#2c1e16]">Clerk setup required</h1>
          <p className="mt-2 text-sm font-cairo text-[#593119]">
            Create a <code className="bg-black/10 px-1 rounded">.env.local</code> file in the project root and add:
          </p>
          <pre className="mt-3 bg-black/10 p-3 rounded text-xs overflow-auto">VITE_CLERK_PUBLISHABLE_KEY=pk_test_...your_key_here...</pre>
          <p className="mt-2 text-xs text-[#593119] font-cairo">Then restart the dev server.</p>
        </div>
      </div>
    )}
  </StrictMode>
);
