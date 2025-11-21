#!/usr/bin/env python3
import json, sys, csv, re
def slugify(s):
    s = re.sub(r"[^a-zA-Z0-9]+","-",s).strip("-").lower()
    return s or "pagina"
def walk(n):
    yield n
    for c in n.get("children",[]) or []:
        yield from walk(c)
def main(inp,outp):
    data=json.load(open(inp,encoding="utf-8"))
    doc=data.get("document",{})
    rows=[["route","frame_name","node_id","requires_auth"]]
    seen=set()
    for n in walk(doc):
        if n.get("type") in ("FRAME","COMPONENT","COMPONENT_SET"):
            name=n.get("name","")
            if not name or name.lower() in ("grid","ui-kit","tokens"): continue
            if name in seen: continue
            seen.add(name)
            route="/" if name.lower().startswith("home") else f"/{slugify(name)}"
            rows.append([route,name,n.get("id",""),"false"])
    with open(outp,"w",newline="",encoding="utf-8") as f:
        csv.writer(f).writerows(rows)
    print(f"Wrote {len(rows)-1} routes → {outp}")
if __name__=="__main__":
    if len(sys.argv)<3:
        print("Uso: generate_routes_from_figma.py <docs/figma.json> <docs/02_routes_map.csv>"); sys.exit(1)
    main(sys.argv[1],sys.argv[2])
