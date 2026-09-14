import { sources } from "./sources";
import { verify } from "./verify";
import type { Candidate, Env, Source, VerifiedScheme } from "./types";

export async function scan(env: Env): Promise<{checked:number; accepted:number}> {
  let checked = 0, accepted = 0;
  await env.DB.prepare("UPDATE schemes SET is_active = 0").run();
  for (const source of sources) {
    try {
      const candidates = await crawlSource(source, env.USER_AGENT);
      for (const candidate of candidates) {
        checked++;
        const scheme = verify(candidate);
        if (scheme) { await upsert(env, scheme); accepted++; }
      }
    } catch (error) { console.error(`Source failed: ${source.name}`, error); }
  }
  return { checked, accepted };
}

export async function crawlSource(source: Source, userAgent: string): Promise<Candidate[]> {
  const response = await fetch(source.url, { headers: { "User-Agent": userAgent, Accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const html = await response.text();
  const text = stripHTML(html);
  const title = decode(first(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1], source.name));
  const description = decode(first(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1], text.slice(0, 500)));
  const links = [...html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)]
    .map(m => ({ url: absolute(m[1], source.url), label: stripHTML(m[2]) }))
    .filter(x => {
      const value = x.label + " " + x.url;
      return x.url && /marketing|brand|consumer|commercial|product/i.test(value) && /graduate|early.career|2027/i.test(value);
    })
    .slice(0, 30);
  const base: Candidate = { employer: source.employer ?? inferEmployer(title, source.name), title, location: "", description, applicationURL: source.url, sourceURL: source.url, sourceName: source.name, pageText: text };
  const results: Candidate[] = source.employer ? [base] : [];
  for (const link of links) {
    if (new URL(link.url).origin !== new URL(source.url).origin) continue;
    await delay(300);
    try {
      const detailResponse = await fetch(link.url, { headers: { "User-Agent": userAgent, Accept: "text/html" }, signal: AbortSignal.timeout(15_000) });
      if (!detailResponse.ok) continue;
      const detailHTML = await detailResponse.text(); const detailText = stripHTML(detailHTML);
      results.push({ ...base, title: link.label || title, description: detailText.slice(0, 700), applicationURL: link.url, sourceURL: link.url, pageText: detailText });
    } catch { /* one vacancy must not abort the source */ }
  }
  return results;
}

async function upsert(env: Env, s: VerifiedScheme) {
  await env.DB.prepare(`INSERT INTO schemes (id,employer,title,location,description,application_url,source_url,source_name,start_year,start_evidence,opened_at,deadline,discovered_at,last_seen_at,is_london,is_active)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1)
    ON CONFLICT(id) DO UPDATE SET employer=excluded.employer,title=excluded.title,location=excluded.location,description=excluded.description,source_url=excluded.source_url,start_evidence=excluded.start_evidence,last_seen_at=excluded.last_seen_at,is_london=excluded.is_london,is_active=1`)
    .bind(s.id,s.employer,s.title,s.location,s.description,s.applicationURL,s.sourceURL,s.sourceName,2027,s.startEvidence,s.openedAt??null,s.deadline??null,s.discoveredAt,s.discoveredAt,s.isLondon?1:0).run();
}

function stripHTML(v:string):string{return decode(v.replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim())}
function decode(v:string):string{return v.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g," ")}
function first(value:string|undefined,fallback:string):string{return value?.trim()||fallback}
function absolute(href:string,base:string):string{try{return new URL(href,base).toString()}catch{return ""}}
function inferEmployer(title:string,fallback:string):string{return title.split(/[|–—-]/)[0]?.trim()||fallback}
function delay(ms:number){return new Promise(resolve=>setTimeout(resolve,ms))}
