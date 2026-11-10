#!/usr/bin/env python3
"""Inline the territory data into the atlas page so it can be published as one file.

The atlas is the third design's own page. It reads the same `territory.json` the matrix reads and
`build.py` writes; this script never writes that file and never touches the matrix. It does the
one thing the matrix's build does at its lines 92 to 101: put the payload into the page as an
inline `<script id="territory-data">` so the built copy fetches nothing but the typefaces the
stylesheet already names.
"""
import json, os

D = os.path.dirname(os.path.abspath(__file__))
board = os.path.join(os.path.dirname(D), "board")

data_path = os.path.join(board, "territory.json")
if not os.path.exists(data_path):
    raise SystemExit(data_path + " is missing; run build.py first")
payload = json.dumps(json.loads(open(data_path).read()), separators=(",", ":"))

src = open(os.path.join(board, "atlas.html")).read()
marker = '<script id="territory-data"'
if marker in src:
    head, rest = src.split(marker, 1)
    src = head + rest.split("</script>", 1)[1]
inline = ('<script id="territory-data" type="application/json">'
          + payload.replace("</", "<\\/") + "</script>\n")
anchor = "<script>\n(function(){"
if anchor not in src:
    raise SystemExit("atlas.html no longer opens its script with " + repr(anchor))
src = src.replace(anchor, inline + anchor, 1)

# The comment button and the form behind it, the one module this page shares with the matrix. The
# copy served from a folder keeps the file beside it and the tag as it stands; the standalone copy
# carries it inside, so it fetches nothing.
SUBMIT_TAG = '<script src="submit.js"></script>'
if SUBMIT_TAG not in src:
    raise SystemExit("atlas.html no longer loads the comment module with " + SUBMIT_TAG)
submit_path = os.path.join(board, "submit.js")
submit_src = open(submit_path).read()
if "</script" in submit_src.lower():
    raise SystemExit(submit_path + " holds a </script sequence and cannot be inlined as it is")
src = src.replace(SUBMIT_TAG, "<script>\n" + submit_src + "</script>", 1)

out_path = os.path.join(board, "atlas-standalone.html")
open(out_path, "w").write(src)
d = json.loads(payload)
print("wrote", out_path, "|", d["counts"], "| subjects", len(d["subjects"]),
      "| capabilities", len(d["capabilities"]), "| tooltips", len(d.get("tooltips", {})),
      "| submit.js", len(submit_src), "bytes |", len(src), "bytes")
