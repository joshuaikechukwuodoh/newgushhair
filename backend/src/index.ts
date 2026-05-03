import app from "./app";

// Serve static files (only in Bun environment)
if (typeof Bun !== "undefined") {
  const { serveStatic } = await import("hono/bun");
  
  // Serve admin static files
  app.use("/admin/*", serveStatic({ root: "../admin/dist" }));
  app.get("/admin/*", serveStatic({ path: "../admin/dist/index.html" }));

  // Serve frontend static files
  app.use("/*", serveStatic({ root: "../frontend/dist" }));
  app.get("/*", serveStatic({ path: "../frontend/dist/index.html" }));
}

export default {
  port: 3000,
  fetch: app.fetch,
};
