import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { crawlSource } from "./crawler";
import { sources } from "./sources";
import { verify } from "./verify";
import type { VerifiedScheme } from "./types";

const output = resolve(process.cwd(), "../docs/api/schemes");
const byID = new Map<string, VerifiedScheme>();

for (const source of sources) {
  try {
    const candidates = await crawlSource(source, "GradScheme2027/1.0 (GitHub Actions; responsible low-rate monitor)");
    for (const candidate of candidates) {
      const verified = verify(candidate);
      if (!verified) continue;
      byID.set(verified.id, verified);
    }
  } catch (error) {
    console.error(`Could not check ${source.name}:`, error);
  }
}

const schemes = [...byID.values()]
  .filter(item => item.startYear === 2027)
  .sort((a, b) => Number(b.isLondon) - Number(a.isLondon) || (a.deadline ?? "9999").localeCompare(b.deadline ?? "9999"));

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({ schemes, generatedAt: new Date().toISOString() }, null, 2) + "\n");
console.log(`Published ${schemes.length} verified 2027 schemes.`);
