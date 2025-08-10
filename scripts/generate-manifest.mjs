// scripts/generate-manifest.mjs
// This script generates a manifest of all JSON files in the data directory,
// excluding index.json. It is used to generate the manifest.json file that
// is used to load the chat services.

// npm run generate-manifest
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const dataDir = join(__dirname, "..", "public", "data");
const outFile = join(dataDir, "index.json");

async function main() {
  await mkdir(dataDir, { recursive: true });
  const files = (await readdir(dataDir)).filter(
    (f) => f.endsWith(".json") && f.toLowerCase() !== "index.json",
  );

  const manifest = [];
  for (const f of files) {
    const raw = await readFile(join(dataDir, f), "utf-8");
    try {
      const json = JSON.parse(raw);
      // pull minimal metadata; fall back gracefully if fields missing
      const id =
        typeof json.id === "string" ? json.id : f.replace(/\.json$/i, "");
      const title = typeof json.title === "string" ? json.title : id;
      const description =
        typeof json.description === "string" ? json.description : "";
      manifest.push({ id, title, description, file: f });
    } catch (e) {
      console.error(`Failed to parse ${f}:`, e);
      // Optionally: exit non‑zero to fail the build
      process.exitCode = 1;
    }
  }

  // sort by title for nicer UX (optional)
  manifest.sort((a, b) => a.title.localeCompare(b.title));

  await writeFile(outFile, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`✓ Wrote ${manifest.length} entries to ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
