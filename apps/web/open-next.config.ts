import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// OpenNext Cloudflare adapter config. Defaults are fine for an SSR app with
// API routes; add an incremental cache (R2/KV) here later if ISR is introduced.
// Docs: https://opennext.js.org/cloudflare
export default defineCloudflareConfig({});
