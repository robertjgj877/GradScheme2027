import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { crawlSource } from "./crawler";
import { sources } from "./sources";
import { verify } from "./verify";
import type { VerifiedScheme } from "./types";

const output = resolve(process.cwd(), "../docs/api/schemes");
const previous = await loadPrevious(output);
const byID = new Map(previous.map(item => [item.id, item]));

for (const source of sources) {
  try {
    const candidates = await crawlSource(source, "GradScheme2027/1.0 (GitHub Actions; responsible low-rate monitor)");
    for (const candidate of candidates) {
      const verified = verify(candidate);
      if (!verified) continue;
      const existing = byID.get(verified.id);
      byID.set(verified.id, existing ? { ...verified, discoveredAt: existing.discoveredAt } : verified);
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

async function loadPrevious(path: string): Promise<VerifiedScheme[]> {
  try {
    const value = JSON.parse(await readFile(path, "utf8"));
    return Array.isArray(value.schemes) ? value.schemes.filter((item: VerifiedScheme) => item.startYear === 2027) : [];
  } catch { return []; }
}
