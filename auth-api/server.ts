import type { BunFile } from "bun";
import { join } from "path";
import { readFileSync } from "fs";

const html = readFileSync(join(import.meta.dir, "test-client.html"), "utf-8");

Bun.serve({
  port: 8888,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/") {
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    // Serve the client.ts file as compiled JavaScript
    if (url.pathname === "/src/client.ts") {
      const clientPath = join(import.meta.dir, "src/client.ts");
      const result = await Bun.build({
        entrypoints: [clientPath],
        target: "browser",
        minify: false,
      });

      if (!result.success) {
        return new Response("Build failed", { status: 500 });
      }

      const output = await result.outputs[0]?.text();
      if (!output) {
        return new Response("Build output is empty", { status: 500 });
      }

      return new Response(output, {
        headers: {
          "Content-Type": "application/javascript",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log("Server running at http://localhost:8888");
