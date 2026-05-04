import path from "path";
import { fileURLToPath } from "url";
import app from "./app";

if (typeof Bun !== "undefined") {
  const { serveStatic } = await import("hono/bun");
  const repoRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../..",
  );
  const adminDist = path.join(repoRoot, "admin", "dist");
  const frontendDist = path.join(repoRoot, "frontend", "dist");

  app.use("/admin/*", serveStatic({ root: adminDist }));
  app.get(
    "/admin/*",
    serveStatic({ path: path.join(adminDist, "index.html") }),
  );

  app.use("/*", serveStatic({ root: frontendDist }));
  app.get("/*", serveStatic({ path: path.join(frontendDist, "index.html") }));
}

export default {
  port: Number(process.env.PORT) || 3000,
  fetch: app.fetch,
};
