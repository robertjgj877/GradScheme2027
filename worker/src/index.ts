import { scan } from "./crawler";
import type { Env } from "./types";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/schemes") {
      const { results } = await env.DB.prepare(`SELECT id,employer,title,location,description,application_url AS applicationURL,source_url AS sourceURL,source_name AS sourceName,start_year AS startYear,start_evidence AS startEvidence,opened_at AS openedAt,deadline,discovered_at AS discoveredAt,is_london AS isLondon FROM schemes WHERE is_active=1 AND start_year=2027 ORDER BY is_london DESC, COALESCE(deadline,'9999') ASC, discovered_at DESC`).all();
      const schemes = (results ?? []).map((r:any)=>({...r,isLondon:Boolean(r.isLondon)}));
      return json({ schemes, generatedAt: new Date().toISOString() });
    }
    if (request.method === "POST" && url.pathname === "/admin/scan") {
      if (!env.ADMIN_TOKEN || request.headers.get("Authorization") !== `Bearer ${env.ADMIN_TOKEN}`) return json({error:"Unauthorized"},401);
      return json(await scan(env));
    }
    if (url.pathname === "/health") return json({ok:true,year:2027});
    return json({error:"Not found"},404);
  },
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> { ctx.waitUntil(scan(env)); }
};

function json(value:unknown,status=200):Response{return new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=300","access-control-allow-origin":"*"}})}

