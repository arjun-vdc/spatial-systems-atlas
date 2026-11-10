#!/usr/bin/env python3
"""Rebuild the territory database from the CSV seeds and any coverage drops.

The rebuild happens in a temporary file beside the target. That file is renamed into place only
after the whole load has succeeded, so a run that fails part way through leaves the existing
territory.db exactly as it was.
"""
import csv, os, sqlite3, sys, json, glob

D = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(D, "territory.db")
TMP = DB + ".building"
TMP_FILES = (TMP, TMP + "-journal", TMP + "-wal", TMP + "-shm")
# The use cases a row may name in interop_uses: the first four, and since the maintainer's
# decision of 2026-11-03 three more (U6 the same thing at the same real place, U7 a training
# result leaves the simulator, U10 shared presence). Each is a certification lane.
USE_CASES = ("U1", "U2", "U3", "U4", "U6", "U7", "U10")

def clear_temp():
    for p in TMP_FILES:
        if os.path.exists(p): os.remove(p)

def rows(name):
    p = os.path.join(D, name)
    if not os.path.exists(p): return []
    with open(p, newline="") as f: return list(csv.DictReader(f))

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
        con.execute("INSERT INTO subject (id,name,kind,org,licence,url,status,version,status_date) VALUES (?,?,?,?,?,?,?,?,?)",
                    (r["id"], r["name"], r["kind"], r["org"] or None, r["licence"] or None,
                     r["url"] or None, r["status"] or None, r["version"] or None, r["status_date"] or None))

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
