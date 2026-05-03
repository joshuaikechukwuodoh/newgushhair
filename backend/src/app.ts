import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { createRouteHandler } from "uploadthing/server";
import { appRouter } from "./routers/_app";
import { createContext } from "./context";
import { uploadRouter } from "./lib/uploadthing";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

app.use(
  "/api/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
  }),
);

const handlers = createRouteHandler({ router: uploadRouter });
app.all("/api/uploadthing", (c) => handlers(c.req.raw));

app.get("/api/health", (c) => c.json({ ok: true, message: "Backend is running" }));

export default app;
