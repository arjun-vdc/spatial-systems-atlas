#!/usr/bin/env python3
"""Export the territory database to one JSON file the matrix page reads."""
import json, os, re, sqlite3
D = os.path.dirname(os.path.abspath(__file__))
con = sqlite3.connect(os.path.join(D, "territory.db")); con.row_factory = sqlite3.Row

groups = [dict(r) for r in con.execute("SELECT * FROM capability_group ORDER BY sort")]
caps   = [dict(r) for r in con.execute("SELECT * FROM capability ORDER BY sort")]

# Every capability carries the interoperability boundary decided in
# infrastructure-wg/model/INTEROPERABILITY-BOUNDARIES.md: must, should or none, and the one
# sentence behind it. The pages filter, mark and measure on this word, so a build that would
# ship a row without one stops here instead of publishing a filter that quietly drops rows.
INTEROP_WORDS = ("must", "should", "none")
blank = [c["id"] for c in caps if c.get("interop") not in INTEROP_WORDS]
if blank:
    raise SystemExit("no interop value on: " + ", ".join(blank) +
                     " - reload the database from capabilities.csv")
interop_counts = {w: sum(1 for c in caps if c["interop"] == w) for w in INTEROP_WORDS}

# The four use cases a row serves, carried to the page as an array so a certification lane can be
# read off it: a lane is the must rows whose list holds that lane's use case. The stored value is
# a comma-separated string; the page never has to split one.
USE_CASES = ("U1", "U2", "U3", "U4")
for c in caps:
    c["uses"] = [u for u in (c.pop("interop_uses", "") or "").split(",") if u]
    bad = [u for u in c["uses"] if u not in USE_CASES]
    if bad:
        raise SystemExit("use case " + ", ".join(bad) + " on " + c["id"] +
                         " is not one of U1 to U4 - reload the database from capabilities.csv")
    if c["interop"] in ("must", "should") and not c["uses"]:
        raise SystemExit("no use case on " + c["id"] + ", which is marked " + c["interop"] +
                         " - reload the database from capabilities.csv")
# The four lane sizes, printed on every build, so a lane that has drifted from
# infrastructure-wg/model/CERTIFICATION-LANES.md shows here rather than on the published page.
lane_counts = {u: sum(1 for c in caps if c["interop"] == "must" and u in c["uses"])
               for u in USE_CASES}
subs   = [dict(r) for r in con.execute("""
    SELECT s.*, (SELECT COUNT(*) FROM coverage c WHERE c.subject_id=s.id) AS scored
    FROM subject s ORDER BY kind, name""")]
# One entry per claim: [level, confidence, note, sources].
# Each source is [address_or_null, title, kind, quote]. Local evidence keeps its title but
# exports a null address, so no path from this machine ever reaches the page.
# One entry per quote, not per address: a claim that cites one address twice for two different
# sentences exports both, and the tie-break on e.id keeps them next to each other, in the order
# they were recorded, under that one address.
cov, cov_key = {}, {}
for r in con.execute("SELECT id, subject_id, capability_id, level, note, confidence FROM coverage"):
    cov.setdefault(r["subject_id"], {})[r["capability_id"]] = [r["level"], r["confidence"],
                                                               r["note"] or "", []]
    cov_key[r["id"]] = (r["subject_id"], r["capability_id"])

for r in con.execute("""
    SELECT e.coverage_id, s.url, s.title, s.kind, e.quote
    FROM evidence e JOIN source s ON s.id = e.source_id
    ORDER BY e.coverage_id,
             CASE s.kind WHEN 'primary' THEN 0 WHEN 'secondary' THEN 1 ELSE 2 END,
             s.id, e.id"""):
    key = cov_key.get(r["coverage_id"])
    if not key:
        continue
    kind = r["kind"] or ""
    url = None if kind == "local-evidence" else r["url"]
    cov[key[0]][key[1]][3].append([url, r["title"] or "", kind, r["quote"] or ""])

# What the header line needs to follow the subjects switched on. "scored" above is the subject's
# own claim count; conflicts is its share of the conflict rows; unverified is its share of the
# claims that rest on no source anybody can check today; source_ids lists the distinct sources its
# claims rest on, so the page can union them across the subjects on screen and count a shared
# source once.
for s in subs:
    s["conflicts"] = con.execute(
        "SELECT COUNT(*) FROM coverage WHERE subject_id=? AND level='conflicts'",
        (s["id"],)).fetchone()[0]
    # Every unverified claim on this map is an absence, and an absence nobody could check is the
    # one number a reader has to be given rather than left to find. The page adds these up over
    # the subjects switched on, the way it adds up conflicts.
    s["unverified"] = con.execute(
        "SELECT COUNT(*) FROM coverage WHERE subject_id=? AND confidence='unverified'",
        (s["id"],)).fetchone()[0]
    s["source_ids"] = [r[0] for r in con.execute(
        "SELECT DISTINCT e.source_id FROM evidence e JOIN coverage c ON c.id = e.coverage_id "
        "WHERE c.subject_id=? ORDER BY e.source_id", (s["id"],))]

tally = {}
for r in con.execute("""
    SELECT capability_id,
           SUM(level IN ('native','via-extension')) AS covers,
           SUM(level='partial')   AS partial,
           SUM(level='conflicts') AS conflicts,
           COUNT(*)               AS scored
    FROM coverage GROUP BY capability_id"""):
    tally[r["capability_id"]] = {"covers": r["covers"], "partial": r["partial"],
                                 "conflicts": r["conflicts"], "scored": r["scored"]}

# Display groups for the subject chips. One cross-cutting group is named explicitly; the rest
# follow the subject's kind. A subject appears in exactly one group.
# Two kinds share one chip group: a learned world model and a capture technique both belong under
# "World models & capture", so groups are keyed by their label and the first kind that carries a
# label names the group. Every kind in `subject.kind` must appear here or its subjects load into
# the database and then show in no chip group on any page.
MSF_IDS = ["rp1", "wow", "teleportxr", "um", "iwps", "omb"]
KIND_LABEL = [("standard", "Standards"), ("device-platform", "Device platforms"),
              ("game-engine", "Game engines"), ("web-runtime", "Web runtimes"),
              ("platform", "Platforms"), ("protocol", "Protocols"), ("project", "Projects"),
              ("world-model", "World models & capture"),
              ("technique", "World models & capture"),
              ("tool", "Capture & generation tools")]
display_groups = [{"id": "msf", "name": "MSF standards & projects",
                   "subjects": [s["id"] for s in subs if s["id"] in MSF_IDS]}]
by_label = {}
for kind, label in KIND_LABEL:
    ids = [s["id"] for s in subs if s["kind"] == kind and s["id"] not in MSF_IDS]
    if not ids:
        continue
    if label in by_label:
        by_label[label]["subjects"].extend(ids)
        continue
    group = {"id": kind, "name": label, "subjects": ids}
    by_label[label] = group
    display_groups.append(group)

# A subject whose kind is in no group would vanish from the chips without a word. Say so instead.
placed = {sid for g in display_groups for sid in g["subjects"]}
missing = [s["id"] for s in subs if s["id"] not in placed]
if missing:
    raise SystemExit("no chip group for kind(s) of: " + ", ".join(missing) +
                     " — add the kind to KIND_LABEL")

# The written explanation of every item on the page, keyed by item id. Only the paragraph is
# exported: each record's "sources" list holds absolute paths on this machine, and no path from
# this machine may reach the published page.
# Every figure the written explanations quote is computed here, from the same database the
# counts come from, and substituted into the prose. The explanations used to carry typed
# numbers; the map grew, the numbers stayed, and the published page spent months telling
# visitors 1,749 claims and 117 capabilities while the database held 6,882 and 162. A typed
# number in prose is a number that will go stale silently, so the prose carries {{tokens}}
# and this build fills them in.
def _one(sql):
    return con.execute(sql).fetchone()[0]

FIGURES = {
    "claims_total": _one("SELECT COUNT(*) FROM coverage"),
    "claims_out_of_scope": _one("SELECT COUNT(*) FROM coverage WHERE level='out-of-scope'"),
    "claims_visible": _one("SELECT COUNT(*) FROM coverage WHERE level<>'out-of-scope'"),
    "claims_verified": _one("SELECT COUNT(*) FROM coverage WHERE confidence='verified'"),
    "claims_reported": _one("SELECT COUNT(*) FROM coverage WHERE confidence='reported'"),
    "claims_unverified": _one("SELECT COUNT(*) FROM coverage WHERE confidence='unverified'"),
    "sources_total": _one("SELECT COUNT(*) FROM source"),
    "sources_primary": _one("SELECT COUNT(*) FROM source WHERE kind='primary'"),
    "sources_secondary": _one("SELECT COUNT(*) FROM source WHERE kind='secondary'"),
    "sources_local": _one("SELECT COUNT(*) FROM source WHERE kind='local-evidence'"),
    "quotes_total": _one("SELECT COUNT(*) FROM evidence"),
    "capabilities_total": len(caps),
    "capabilities_must": interop_counts["must"],
    "capabilities_should": interop_counts["should"],
    "capabilities_no_interop": interop_counts["none"],
    "subjects_total": len(subs),
    "conflicts_total": _one("SELECT COUNT(*) FROM coverage WHERE level='conflicts'"),
    "capabilities_format": _one("SELECT COUNT(*) FROM capability WHERE binding='build'"),
    "capabilities_protocol": _one("SELECT COUNT(*) FROM capability WHERE binding='connect'"),
    "claims_native": _one("SELECT COUNT(*) FROM coverage WHERE level='native'"),
    "claims_via_extension": _one("SELECT COUNT(*) FROM coverage WHERE level='via-extension'"),
    "claims_partial": _one("SELECT COUNT(*) FROM coverage WHERE level='partial'"),
    "claims_none": _one("SELECT COUNT(*) FROM coverage WHERE level='none'"),
    "groups_total": len(groups),
}

# A lane's size is its count of must rows, so the lane notes take a token as well.
for _u, _n in lane_counts.items():
    FIGURES["lane_" + _u.lower()] = _n
# So does a group's size, which grows whenever a row is added to it.
for _g in groups:
    FIGURES["capabilities_in_" + _g["id"]] = sum(1 for c in caps if c["group_id"] == _g["id"])

# Prose that names one subject's breadth gets a token too, so "Unreal has the most"
# cannot quietly become false. reach counts the rows a subject has at built in,
# through an extension, or partial — the one definition used everywhere.
for _sid, _n in con.execute(
        "SELECT subject_id, COUNT(*) FROM coverage "
        "WHERE level IN ('native','via-extension','partial') GROUP BY subject_id"):
    FIGURES["reach_" + _sid] = _n

# Numbers read better with thousands separators in prose than in a count line.
FIGURE_TEXT = {k: f"{v:,}" for k, v in FIGURES.items()}

TOKEN = re.compile(r"\{\{([a-z0-9_-]+)\}\}")
# Figures that were typed into the prose once and then went stale. If one reappears as a
# literal, the build stops rather than publishing it again.
STALE_LITERALS = ["1,749", "1,057", "2,669", "117 capabilities", "89 capabilities",
                  "40 of the 117", "Forty of the 117"]

def fill(text, where):
    unknown = [m.group(1) for m in TOKEN.finditer(text) if m.group(1) not in FIGURE_TEXT]
    if unknown:
        raise SystemExit(f"{where}: unknown figure token(s): {', '.join(sorted(set(unknown)))}. "
                         f"Known: {', '.join(sorted(FIGURE_TEXT))}")
    filled = TOKEN.sub(lambda m: FIGURE_TEXT[m.group(1)], text)
    for stale in STALE_LITERALS:
        if stale in filled:
            raise SystemExit(f"{where}: the prose still types the stale figure '{stale}'. "
                             f"Replace it with a {{{{token}}}} so the build keeps it current.")
    return filled

tips_path = os.path.join(D, "tooltips", "tooltips.json")
tips = {}
if os.path.exists(tips_path):
    with open(tips_path) as fh:
        for k, v in json.load(fh).items():
            text = v.get("tooltip") if isinstance(v, dict) else v
            if text:
                tips[k] = fill(text, f"tooltip {k}")

out = {"groups": groups, "capabilities": caps, "subjects": subs, "coverage": cov, "tally": tally,
       "display_groups": display_groups, "tooltips": tips,
       "counts": {"claims": con.execute("SELECT COUNT(*) FROM coverage").fetchone()[0],
                  "sources": con.execute("SELECT COUNT(*) FROM source").fetchone()[0],
                  "conflicts": con.execute("SELECT COUNT(*) FROM coverage WHERE level='conflicts'").fetchone()[0],
                  "unverified": con.execute("SELECT COUNT(*) FROM coverage WHERE confidence='unverified'").fetchone()[0],
                  "must": interop_counts["must"], "should": interop_counts["should"],
                  "no_interop": interop_counts["none"], "lanes": lane_counts}}
board = os.path.join(os.path.dirname(D), "board")
p = os.path.join(board, "territory.json")
payload = json.dumps(out, separators=(",", ":"))
open(p, "w").write(payload)

# The index carries everything the landing view needs — groups, capabilities,
# subjects, display groups, tooltips, counts, and the level + confidence per
# claim — without the notes and sources that make coverage large. The React app
# loads it first, renders immediately, and fetches the full payload behind the
# scenes. Notes and sources are read only when the row panel opens.
index_cov = {}
for sid in cov:
    index_cov[sid] = {}
    for cid in cov[sid]:
        index_cov[sid][cid] = cov[sid][cid][:2]
index_out = {"groups": groups, "capabilities": caps, "subjects": subs,
             "coverage": index_cov, "tally": tally,
             "display_groups": display_groups, "tooltips": tips,
             "counts": out["counts"]}
index_path = os.path.join(board, "territory-index.json")
index_payload = json.dumps(index_out, separators=(",", ":"))
open(index_path, "w").write(index_payload)

# The page is written as one shell and eight modules, so several people can work on different
# parts of it at once. What is published is still one file: the data, the stylesheet and every
# module below are inlined into matrix-standalone.html, in the order the shell loads them.
src = open(os.path.join(board, "matrix.html")).read()
marker = '<script id="territory-data"'
if marker in src:
    head, rest = src.split(marker, 1)
    src = head + rest.split("</script>", 1)[1]
inline = ('<script id="territory-data" type="application/json">'
          + payload.replace("</", "<\\/") + "</script>\n")

# The data block goes in above the modules, so it stands in the document before the module that
# reads it.
FIRST = '<script src="predicates.js"></script>'
if FIRST not in src:
    raise SystemExit("matrix.html no longer loads the modules, starting with " + FIRST)
src = src.replace(FIRST, inline + FIRST, 1)

# The stylesheet goes in where its link stands.
css_tag = '<link rel="stylesheet" href="matrix.css">'
css_path = os.path.join(board, "matrix.css")
if css_tag not in src:
    raise SystemExit("matrix.html no longer loads the stylesheet with " + css_tag)
css_src = open(css_path).read()
if "</style" in css_src.lower():
    raise SystemExit(css_path + " holds a </style sequence and cannot be inlined as it is")
src = src.replace(css_tag, "<style>\n" + css_src + "</style>", 1)

# The modules, in the order the shell loads them: the shared row rules first, then the
# explanation box, matrix mode, the diagram, the export, the search field, the coverage metric,
# and last the one that starts the page. None of them fetches anything, so the built page asks
# for no address but the type service the stylesheet already names. The copy served from a
# folder keeps the eight files beside it and these tags as they stand.
# submit.js is last and is the one module the atlas shares: it builds the comment button and the
# form behind it, and it depends on nothing above it.
MODULES = ["predicates.js", "tooltips.js", "matrix.js", "c4.js", "export.js", "search.js",
           "metric.js", "switch.js", "submit.js"]
sizes = []
for name in MODULES:
    tag = '<script src="%s"></script>' % name
    if tag not in src:
        raise SystemExit("matrix.html no longer loads the module with " + tag)
    mod_path = os.path.join(board, name)
    mod_src = open(mod_path).read()
    if "</script" in mod_src.lower():
        raise SystemExit(mod_path + " holds a </script sequence and cannot be inlined as it is")
    src = src.replace(tag, "<script>\n" + mod_src + "</script>", 1)
    sizes.append("%s %d" % (name, len(mod_src)))

# The standalone copy is one file that can be published anywhere: production serves it as the
# map page, and a private copy of it lives off this site. So its two download links carry the
# whole address of the files rather than a bare name that only resolves beside them. The
# served-from-a-folder copy, matrix.html, keeps the relative names.
MAP_URL = "https://openspatials.com/msf/map/"
for name in ("territory.csv", "territory.md"):
    rel = 'href="%s"' % name
    # The links arrive with the export menu. Until that menu is on the page there is nothing
    # to rewrite, so a missing link is not an error.
    if rel in src:
        src = src.replace(rel, 'href="%s%s"' % (MAP_URL, name), 1)

out_path = os.path.join(board, "matrix-standalone.html")
open(out_path, "w").write(src)
print("wrote", p, "and", out_path, "|", out["counts"], "| tooltips", len(tips),
      "| interop", interop_counts, "| lanes", lane_counts,
      "| css", len(css_src), "bytes | modules inlined:", ", ".join(sizes),
      "| index", len(index_payload), "bytes")

# The two files anyone can take the map away in, written from the same database into the same
# folder, so a build never leaves them behind the page.
import export_files
export_files.main()
