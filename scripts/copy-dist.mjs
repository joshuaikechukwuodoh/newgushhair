import { cp, mkdir, rm } from "node:fs/promises";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
await cp("frontend/dist", "dist", { recursive: true });
await mkdir("dist/admin", { recursive: true });
await cp("admin/dist", "dist/admin", { recursive: true });
