#!/usr/bin/env python3
"""Rebuild the territory database from the CSV seeds and any coverage drops.

The rebuild happens in a temporary file beside the target. That file is renamed into place only
after the whole load has succeeded, so a run that fails part way through leaves the existing
territory.db exactly as it was.
"""
import csv, os, re, sqlite3, sys, json, glob

D = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(D, "territory.db")
TMP = DB + ".building"
TMP_FILES = (TMP, TMP + "-journal", TMP + "-wal", TMP + "-shm")
# The use cases a row may name in interop_uses: the first four, and since the maintainer's
# decision of 2026-11-03 three more (U6 the same thing at the same real place, U7 a training
# result leaves the simulator, U10 shared presence). Each is a certification lane.
USE_CASES = ("U1", "U2", "U3", "U4", "U6", "U7", "U10")
# The kinds of platform, in the order the pages group them. Only a subject whose kind is
# platform carries one.
PLATFORM_SUBCATEGORIES = ("social-world", "game-platform", "ai-built-world")

def clear_temp():
    for p in TMP_FILES:
        if os.path.exists(p): os.remove(p)

def rows(name):
    p = os.path.join(D, name)
    if not os.path.exists(p): return []
    with open(p, newline="") as f: return list(csv.DictReader(f))

USE_CASE_FILE = "related-use-cases.json"
BASES = ("derived", "proposed")
ORIGINS = ("contributor", "contributor-public-record", "atlas-reader")
REVIEW = ("unreviewed", "accepted", "needs-change", "rejected", "stale")
SPECIFICITY = ("generic", "specialised", "individual", "unknown")


def load_use_cases(con):
    """Load the related-use-case records, kept apart from coverage, confidence and sources.

    A record that names an unknown capability, a word outside its field's list, an address that
    is not public, or a use case described two different ways stops the load."""
    path = os.path.join(D, USE_CASE_FILE)
    if not os.path.exists(path):
        return
    with open(path) as f:
        doc = json.load(f)
    known = {r[0] for r in con.execute("SELECT id FROM capability")}
    where = USE_CASE_FILE

    def need(ok, msg):
        if not ok:
            sys.exit(f"{where}: {msg}")

    src = doc["contribution"]
    for key in ("repository", "branch", "folder", "commit", "committed", "refreshed",
                "use_case_repository", "use_case_repository_url"):
        need(src.get(key), f"contribution has no {key}")
        con.execute("INSERT INTO use_case_source (key,value) VALUES (?,?)", (key, str(src[key])))
    need(re.fullmatch(r"[0-9a-f]{40}", src["commit"]), "contribution commit is not a full commit id")
    reading = doc.get("record_reading", {})
    con.execute("INSERT INTO use_case_source (key,value) VALUES (?,?)",
                ("records_read_at", reading.get("read_at", "")))
    con.execute("INSERT INTO use_case_source (key,value) VALUES (?,?)",
                ("atlas_figures_date", doc["coverage"].get("atlas_figures_date", "")))

    cases, link_rows = {}, []
    for r in doc["records"]:
        uc, cap = r["use_case"], r["capability"]
        lid = r["link_id"]
        need(lid == f"{uc['id']}~{cap['id']}", f"{lid} is not <use case id>~<capability id>")
        need(cap["id"] in known, f"{lid} names capability {cap['id']}, which is not a row")
        need(r["basis"] in BASES, f"{lid} has basis '{r['basis']}'; use {', '.join(BASES)}")
        need(r["origin"] in ORIGINS, f"{lid} has origin '{r['origin']}'")
        need(r["review"]["status"] in REVIEW, f"{lid} has review status '{r['review']['status']}'")
        need(uc["specificity"] in SPECIFICITY, f"{lid} has specificity '{uc['specificity']}'")
        need(uc["url"].startswith("https://"), f"{lid} links to {uc['url']}; give the public record")
        need(r["explanation"]["source_passage"].strip(), f"{lid} quotes no words of the record")
        sv = r["source_version"]
        case = (uc["title"], uc["url"], uc["repository"], uc.get("record_status"),
                uc.get("record_version"), uc.get("record_date_shown"), uc["specificity"],
                ",".join(uc.get("extends", [])), sv.get("public_record_read_at"),
                sv.get("public_record_sha256"))
        need(cases.setdefault(uc["id"], case) == case, f"{uc['id']} is described two ways")
        link_rows.append((
            "INSERT INTO use_case_link (id,use_case_id,capability_id,source_passage,source_section,"
            "rationale,rationale_by,basis,origin,contribution_commit,contribution_refreshed,"
            "in_pinned_commit,passage_found,basis_on_public_record,checked_release,definition_as_read,"
            "review_status,reviewed_at,review_note,drift) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            (lid, uc["id"], cap["id"], r["explanation"]["source_passage"],
             r["explanation"].get("source_section"), r["explanation"]["rationale"],
             r["explanation"]["rationale_by"], r["basis"], r["origin"], sv["contribution_commit"],
             sv.get("contribution_refreshed"), int(bool(sv.get("in_pinned_commit"))),
             int(bool(sv["passage_found_on_public_record"])), sv.get("basis_on_public_record"),
             cap.get("atlas_release"), cap.get("definition_as_read"), r["review"]["status"],
             r["review"].get("reviewed_at"), r["review"].get("review_note"),
             json.dumps(r.get("drift", []), ensure_ascii=False))))
    read = reading.get("cases", {})
    for cid, c in cases.items():
        imp = read.get(cid, {})
        con.execute("INSERT INTO use_case (id,title,url,repository,record_status,record_version,"
                    "record_date,specificity,extends,read_at,record_sha256,implementations_stated,"
                    "implementations_linked) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)",
                    (cid, *c, imp.get("implementations_stated"),
                     ",".join(imp.get("implementations_linked", []))))
    # A link names its case, so the cases go in first.
    for sql, values in link_rows:
        con.execute(sql, values)
    for row in doc["coverage"]["rows"]:
        need(row["capability_id"] in known, f"coverage names {row['capability_id']}, which is not a row")
        atlas = row.get("source_atlas") or {}
        con.execute("INSERT INTO use_case_coverage (capability_id,source_interop,use_cases,"
                    "specialisations,deployments,use_case_ids,source_native,source_partial,"
                    "source_scored) VALUES (?,?,?,?,?,?,?,?,?)",
                    (row["capability_id"], row.get("source_interop"), row["use_cases"],
                     row["specialisations"], row["deployments"], ",".join(row["use_case_ids"]),
                     atlas.get("native"), atlas.get("partial"), atlas.get("scored")))


def build(con):
    """Fill one empty database. Returns the one-line summary to print on success."""
    con.executescript(open(os.path.join(D, "schema.sql")).read())

    for r in rows("capability_groups.csv"):
        con.execute("INSERT INTO capability_group (id,name,plane,sort) VALUES (?,?,?,?)",
                    (r["id"], r["name"], r["plane"], int(r["sort"])))
    for r in rows("capabilities.csv"):
        # interop says how much two independent systems have to agree on this row before the
        # four use cases work. The seed carries it and its one-sentence reason; a row with a
        # word outside the three stops the load rather than loading a value no page can read.
        interop = (r.get("interop") or "").strip()
        if interop not in ("must", "should", "none"):
            sys.exit(f"capabilities.csv: {r['id']} has interop '{interop}'; "
                     f"use must, should or none")
        reason = (r.get("interop_reason") or "").strip()
        if not reason:
            sys.exit(f"capabilities.csv: {r['id']} is '{interop}' with no interop_reason; "
                     f"every row carries the one sentence that decided it")
        # interop_uses names which of the use cases the row serves. A certification lane
        # is the pair (must row, use case), so a wrong or missing value here would draw a lane
        # that disagrees with the boundaries page. A bad value stops the load the way a bad
        # interop word does.
        uses = [u.strip() for u in (r.get("interop_uses") or "").split(",") if u.strip()]
        for u in uses:
            if u not in USE_CASES:
                sys.exit(f"capabilities.csv: {r['id']} has use case '{u}'; "
                         f"use one of {', '.join(USE_CASES)}")
        if len(set(uses)) != len(uses):
            sys.exit(f"capabilities.csv: {r['id']} names a use case twice in interop_uses")
        if interop in ("must", "should") and not uses:
            sys.exit(f"capabilities.csv: {r['id']} is '{interop}' with no interop_uses; "
                     f"a row two systems have to agree on serves at least one use case")
        if interop == "none" and uses:
            sys.exit(f"capabilities.csv: {r['id']} needs no agreement yet names "
                     f"use cases in interop_uses")
        con.execute("INSERT INTO capability (id,group_id,name,definition,binding,interop,"
                    "interop_reason,interop_uses,sort) VALUES (?,?,?,?,?,?,?,?,?)",
                    (r["id"], r["group_id"], r["name"], r["definition"], r["binding"],
                     interop, reason, ",".join(uses), int(r["sort"])))
    for r in rows("subjects.csv"):
        # Every platform names its kind of platform, so the pages can group platforms, and no
        # other subject names one. A missing or wrong word stops the load rather than loading a
        # platform the pages would show in no group.
        sub = (r.get("subcategory") or "").strip()
        if r["kind"] == "platform" and sub not in PLATFORM_SUBCATEGORIES:
            sys.exit(f"subjects.csv: platform {r['id']} has subcategory '{sub}'; "
                     f"use one of {', '.join(PLATFORM_SUBCATEGORIES)}")
        if r["kind"] != "platform" and sub:
            sys.exit(f"subjects.csv: {r['id']} is a {r['kind']}, not a platform, "
                     f"yet names subcategory '{sub}'")
        con.execute("INSERT INTO subject (id,name,kind,org,licence,url,status,version,status_date,subcategory) "
                    "VALUES (?,?,?,?,?,?,?,?,?,?)",
                    (r["id"], r["name"], r["kind"], r["org"] or None, r["licence"] or None,
                     r["url"] or None, r["status"] or None, r["version"] or None, r["status_date"] or None,
                     sub or None))

    # Keep canonical metadata for shared URLs stable when new claims occur earlier in the
    # coverage order. These records come from existing claims; each claim retains its own
    # original source entry and quote in the coverage JSON.
    with open(os.path.join(D, "source-metadata.json")) as f:
        source_metadata = json.load(f)

    # coverage drops: data/coverage/<subject_id>.json produced by research
    def source_id(url, title=None, retrieved=None, kind="primary"):
        cur = con.execute("SELECT id FROM source WHERE url=?", (url,)).fetchone()
        if cur: return cur[0]
        if url in source_metadata:
            metadata = source_metadata[url]
            title, retrieved, kind = metadata["title"], metadata["retrieved"], metadata["kind"]
        return con.execute("INSERT INTO source (url,title,retrieved,kind) VALUES (?,?,?,?)",
                           (url, title, retrieved, kind)).lastrowid

    loaded = 0
    for path in sorted(glob.glob(os.path.join(D, "coverage", "*.json"))):
        doc = json.load(open(path))
        sid = doc["subject_id"]
        if doc.get("summary"):
            con.execute("UPDATE subject SET summary=? WHERE id=?", (doc["summary"], sid))
        for c in doc.get("coverage", []):
            # direction is optional. Absent means the claim says nothing about reading versus
            # writing, and the column stays null; older records that never carried the key load unchanged.
            direction = c.get("direction")
            if direction is not None and direction not in ("read", "write", "both"):
                sys.exit(f"{os.path.basename(path)}: {c['capability_id']} has direction "
                         f"'{direction}'; use read, write or both, or leave the key out")
            cov = con.execute(
                "INSERT OR REPLACE INTO coverage (subject_id,capability_id,level,note,confidence,direction) VALUES (?,?,?,?,?,?)",
                (sid, c["capability_id"], c["level"], c.get("note"), c.get("confidence", "unverified"),
                 direction)).lastrowid
            for s in c.get("sources", []):
                # The database is published, so a source address must be a public one or a
                # plain description; a file path on the maintainer's machine is refused.
                if (s.get("url") or "").startswith(("/", "~", "file:")):
                    sys.exit(f"{os.path.basename(path)}: {c['capability_id']} cites a path on this "
                             f"machine; give its public address or a plain description")
                # Every source entry becomes its own row. One claim may cite one address twice
                # for two different sentences; evidence is keyed by its own row id, so the
                # second quote lands instead of being ignored as a repeat of the first.
                con.execute("INSERT INTO evidence (coverage_id,source_id,quote) VALUES (?,?,?)",
                            (cov, source_id(s["url"], s.get("title"), s.get("retrieved"), s.get("kind", "primary")),
                             s.get("quote")))
            loaded += 1
    load_use_cases(con)
    con.commit()
    n = lambda q: con.execute(q).fetchone()[0]
    # The three boundary values, counted from the rows that were just loaded, so a run says
    # out loud how many capabilities two systems must agree on.
    bounds = dict(con.execute("SELECT interop, COUNT(*) FROM capability GROUP BY interop"))
    # The certification lanes, counted the way the atlas counts them: the must rows that
    # serve one use case. A run says the four sizes out loud so a seed that has drifted from
    # infrastructure-wg/model/CERTIFICATION-LANES.md is visible at the load rather than on the
    # published page.
    lane_counts = {u: con.execute(
        "SELECT COUNT(*) FROM capability WHERE interop='must' AND "
        "(',' || interop_uses || ',') LIKE ?", ("%," + u + ",%",)).fetchone()[0]
        for u in USE_CASES}
    lanes = " ".join(f"{u} {lane_counts[u]}" for u in USE_CASES)
    return (f"capabilities {n('SELECT COUNT(*) FROM capability')}  subjects {n('SELECT COUNT(*) FROM subject')}"
            f"  coverage {n('SELECT COUNT(*) FROM coverage')}  sources {n('SELECT COUNT(*) FROM source')}"
            f"  quotes {n('SELECT COUNT(*) FROM evidence')}"
            f"  directed {n('SELECT COUNT(*) FROM coverage WHERE direction IS NOT NULL')}"
            f"  use-case links {n('SELECT COUNT(*) FROM use_case_link')}"
            f" ({n('SELECT COUNT(*) FROM use_case')} cases,"
            f" {n('SELECT COUNT(*) FROM use_case_coverage')} coverage rows)"
            f"  interop must {bounds.get('must', 0)}"
            f" should {bounds.get('should', 0)} none {bounds.get('none', 0)}"
            f"  lanes {lanes}")

clear_temp()
con = sqlite3.connect(TMP)
try:
    summary = build(con)
except BaseException:
    # Any failure at all, including sys.exit on a bad record: throw the half-built file away and
    # leave the database that is already on disk untouched.
    con.close()
    clear_temp()
    raise
con.close()
os.replace(TMP, DB)
print(summary)
