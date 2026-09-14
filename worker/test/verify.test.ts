import { describe, expect, it } from "vitest";
import { verify } from "../src/verify";

const base = { employer:"Example",title:"Marketing Graduate Programme",location:"London",description:"Build famous brands.",applicationURL:"https://example.com/apply",sourceURL:"https://example.com/job",sourceName:"Example Careers" };

describe("2027 verification",()=>{
  it("accepts explicit start evidence",()=>{ expect(verify({...base,pageText:"The role will start in September 2027."})?.startYear).toBe(2027) });
  it("rejects merely posted in 2027",()=>{ expect(verify({...base,pageText:"Posted 4 January 2027."})).toBeNull() });
  it("rejects stale start years",()=>{ expect(verify({...base,pageText:"Applications close soon. Starting in 2026. 2027 plans follow."})).toBeNull() });
  it("rejects non-marketing roles",()=>{ expect(verify({...base,title:"Finance Graduate",description:"Accounting",pageText:"2027 Graduate Programme"})).toBeNull() });
});
