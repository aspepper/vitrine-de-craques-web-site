#!/usr/bin/env python3
import argparse, json, os, re, sys, unicodedata

DEFAULT_TYPES = ["FRAME", "COMPONENT", "INSTANCE", "SECTION"]
DEFAULT_SKIP_RE = r"(?i)\bui\s*[-_ ]?kit\b"
HEAVY_KEYS = {"absoluteRenderBounds"}

def eprint(*a, **k): print(*a, file=sys.stderr, **k)

def slugify(s: str) -> str:
    if not isinstance(s, str): return "page"
    n = unicodedata.normalize("NFKD", s)
    n = "".join(ch for ch in n if not unicodedata.combining(ch))
    n = re.sub(r"[^\w\s\-]", "", n)
    n = re.sub(r"[\s\-]+", "-", n.strip().lower())
    return n or "page"

def strip_heavy(node):
    if isinstance(node, dict):
        for k in list(node.keys()):
            if k in HEAVY_KEYS:
                node.pop(k, None)
        for v in node.values():
            strip_heavy(v)
    elif isinstance(node, list):
        for v in node:
            strip_heavy(v)

def main():
    ap = argparse.ArgumentParser(description="Split Figma CANVAS children as separate JSONs (screens/pages).")
    ap.add_argument("input_json")
    ap.add_argument("out_dir")
    ap.add_argument("--types", default=",".join(DEFAULT_TYPES),
                    help="Comma-separated node types to export (default: FRAME,COMPONENT,INSTANCE,SECTION)")
    ap.add_argument("--skip-name-regex", default=DEFAULT_SKIP_RE,
                    help="Regex (case-insensitive) to skip by name (default: '(?i)ui[-_ ]?kit')")
    ap.add_argument("--no-strip-heavy", action="store_true",
                    help="Do not remove heavy keys (absoluteRenderBounds)")
    args = ap.parse_args()

    with open(args.input_json, "r", encoding="utf-8") as f:
        data = json.load(f)

    types = [t.strip().upper() for t in args.types.split(",") if t.strip()]
    skip_re = re.compile(args.skip_name_regex) if args.skip_name_regex else None
    os.makedirs(args.out_dir, exist_ok=True)

    doc = data.get("document") or {}
    canvases = [n for n in (doc.get("children") or []) if isinstance(n, dict) and n.get("type") == "CANVAS"]
    if not canvases:
        eprint("Nenhum CANVAS encontrado em document.children[].")
        return 1

    index = []
    for canvas in canvases:
        c_name = canvas.get("name", "")
        c_id = canvas.get("id", "")
        children = canvas.get("children") or []
        for node in children:
            if not isinstance(node, dict): continue
            n_type = node.get("type", "")
            n_name = node.get("name", "")
            if types and n_type not in types:
                continue
            if skip_re and n_name and skip_re.search(n_name):
                # skip ui-kit and similar
                continue

            slug = slugify(n_name or f"{n_type}-{node.get('id','').replace(':','_')}")
            out_path = os.path.join(args.out_dir, f"{slug}.json")

            # deep copy via json round-trip
            obj = json.loads(json.dumps(node))
            if not args.no_strip_heavy:
                strip_heavy(obj)

            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(obj, f, ensure_ascii=False, indent=2)

            index.append({
                "canvas_name": c_name, "canvas_id": c_id,
                "name": n_name, "id": node.get("id",""),
                "type": n_type, "slug": slug, "file": out_path
            })
            print(f"✔ {c_name} › {n_name} ({n_type}) → {out_path}")

    idx_path = os.path.join(args.out_dir, "index.json")
    with open(idx_path, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)
    print(f"Index: {idx_path}  (total {len(index)} tela(s))")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
