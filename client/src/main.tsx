import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "@app/App";
import "@shared/lib/i18n";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

if (root.dataset.prerendered === "true") hydrateRoot(root, app);
else createRoot(root).render(app);
