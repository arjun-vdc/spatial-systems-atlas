#!/usr/bin/env python3
"""Write the two download copies of the territory map: territory.csv and territory.md.

The CSV is the whole record, one row per claim, with the note and the sources.
The Markdown is the map as a reader sees it: one table per capability group, subjects
across the top, one symbol per cell, and every capability's binding word and definition
under its table.

Both files are built from `territory.db` alone. Run it twice on the same database and the
bytes are the same: the row order is fixed, the source order is fixed, and the build time
is read from the database file rather than from the clock.

Local evidence keeps its title and never its address, so no path from this machine reaches
either file. The script proves that before it writes.
"""
import csv
import io
import os
import sqlite3
import sys
import time

D = os.path.dirname(os.path.abspath(__file__))
BOARD = os.path.join(os.path.dirname(D), "board")

# The six levels, in the order the page's legend lists them, and the mark each one gets.
SYMBOL = {
    "native": "\u25cf",          # filled circle  - built in
    "via-extension": "\u2295",   # circled plus   - through an extension
    "partial": "\u25d0",         # half circle    - partial
    "none": "\u25cb",            # open circle    - absent
    "conflicts": "\u2715",       # cross          - conflicts
    "out-of-scope": "\u2013",    # en dash        - out of scope
}
LEGEND = [
    ("\u25cf", "built in"),
    ("\u2295", "through an extension"),
    ("\u25d0", "partial"),
    ("\u25cb", "absent"),
    ("\u2715", "conflicts, will not interoperate"),
    ("\u2013", "out of scope"),
    ("(blank)", "no claim recorded for that pair"),
]
COLUMNS = ["subject_id", "subject", "kind", "status", "group", "capability_id",
           "capability", "binding", "interop", "interop_reason", "level", "confidence",
           "note", "sources"]

# The word the boundaries page decided for a row, printed in the Markdown tables' Boundary
# column beside the capability's name. must means a use case fails outright unless two
# independent systems agree here; should means it finishes with visible loss; none means nothing
# crosses the boundary at all. The three words are the boundaries page's own, written out rather
# than marked, because every other column in these tables is a mark and a fourth glyph here
# would read as one.
BOUNDARY_WORD = {"must": "must", "should": "should", "none": "none"}


def bind_word(binding):
    """The word the page prints beside a row: a protocol row is agreed when two systems
    connect, a format row is fixed when the content is made."""
    return "protocol" if binding == "connect" else "format"


def cell(text):
    """One Markdown table cell. A pipe inside a name would end the cell early."""
    return (text or "").replace("|", "\\|").replace("\n", " ").strip()


def read(con):
    """Everything the two files need, in a fixed order."""
    con.row_factory = sqlite3.Row
    groups = [dict(r) for r in con.execute(
        "SELECT id, name, plane, sort FROM capability_group ORDER BY sort, id")]
    caps = [dict(r) for r in con.execute(
        "SELECT id, group_id, name, definition, binding, interop, interop_reason, sort "
        "FROM capability ORDER BY sort, id")]
    subs = [dict(r) for r in con.execute(
        "SELECT id, name, kind, status FROM subject ORDER BY kind, name, id")]

    claims = {}
    for r in con.execute(
            "SELECT id, subject_id, capability_id, level, note, confidence FROM coverage"):
        claims[(r["subject_id"], r["capability_id"])] = {
            "id": r["id"], "level": r["level"], "note": r["note"] or "",
            "confidence": r["confidence"] or "", "sources": []}

    by_coverage = {c["id"]: c for c in claims.values()}
    # Primary sources first, then secondary, then local evidence; inside a kind, by source id.
    # These two files list the addresses a claim rests on, not its quotes, so a claim that cites
    # one address twice names it once: DISTINCT keeps the list of addresses as it reads.
    for r in con.execute(
            "SELECT DISTINCT e.coverage_id, s.url, s.title, s.kind FROM evidence e "
            "JOIN source s ON s.id = e.source_id "
            "ORDER BY e.coverage_id, "
            "CASE s.kind WHEN 'primary' THEN 0 WHEN 'secondary' THEN 1 ELSE 2 END, s.id"):
        claim = by_coverage.get(r["coverage_id"])
        if claim is None:
            continue
        # Local evidence lives on this machine; its address is a path here, so the title
        # stands in for it.
        label = (r["title"] or "") if r["kind"] == "local-evidence" else (r["url"] or "")
        if label:
            claim["sources"].append(label)
    return groups, caps, subs, claims


def build_csv(caps, subs, claims):
    buf = io.StringIO(newline="")
    w = csv.writer(buf, lineterminator="\r\n", quoting=csv.QUOTE_MINIMAL)
    w.writerow(COLUMNS)
    rows = 0
    for s in subs:
        for c in caps:
            claim = claims.get((s["id"], c["id"]))
            if claim is None:
                continue
            w.writerow([s["id"], s["name"], s["kind"], s["status"] or "",
                        c["group_name"], c["id"], c["name"], bind_word(c["binding"]),
                        c["interop"], c["interop_reason"],
                        claim["level"], claim["confidence"], claim["note"],
                        " | ".join(claim["sources"])])
            rows += 1
    return buf.getvalue(), rows


def build_md(groups, caps, subs, claims, counts, built):
    out = []
    out.append("# Territory map of spatial computing capabilities")
    out.append("")
    out.append("Every mark below is one claim held in a database and tied to a source. "
               "This file is the map read straight through: capabilities down the side, "
               "subjects across the top.")
    out.append("")
    out.append("- Claims: {:,}".format(counts["claims"]))
    out.append("- Subjects: {:,}".format(counts["subjects"]))
    out.append("- Capabilities: {:,} in {:,} groups".format(
        counts["capabilities"], counts["groups"]))
    out.append("- Sources: {:,}".format(counts["sources"]))
    out.append("- Recorded conflicts: {:,}".format(counts["conflicts"]))
    out.append("- Built from the territory database as it stood at " + built)
    out.append("")
    out.append("## Legend")
    out.append("")
    for mark, meaning in LEGEND:
        out.append("- `{}` {}".format(mark, meaning))
    out.append("")
    out.append("A **format** capability is fixed when the content is made. "
               "A **protocol** capability is agreed between two systems when they connect.")
    out.append("")
    out.append("The **Boundary** column says how much two independent systems have to agree "
               "on that row: `must` means a use case fails outright without agreement, "
               "`should` means it finishes with visible loss, and `none` means nothing crosses "
               "the boundary at all. The word on each row, and the one sentence that decided "
               "it, are in `territory.csv` beside this file.")
    out.append("")
    out.append("The notes behind each claim, and the sources each claim rests on, "
               "are in `territory.csv` beside this file.")
    out.append("")

    header = "| Capability | Boundary | " + " | ".join(cell(s["name"]) for s in subs) + " |"
    rule = "| --- | --- | " + " | ".join("---" for _ in subs) + " |"
    cap_rows = 0
    for g in groups:
        rows = [c for c in caps if c["group_id"] == g["id"]]
        if not rows:
            continue
        out.append("## " + cell(g["name"]))
        out.append("")
        out.append(header)
        out.append(rule)
        for c in rows:
            marks = []
            for s in subs:
                claim = claims.get((s["id"], c["id"]))
                marks.append(SYMBOL.get(claim["level"], "?") if claim else "")
            out.append("| " + cell(c["name"]) + " | " +
                       BOUNDARY_WORD.get(c["interop"], "") + " | " +
                       " | ".join(marks) + " |")
            cap_rows += 1
        out.append("")
        for c in rows:
            out.append("- **{}** ({}) - {}".format(
                cell(c["name"]), bind_word(c["binding"]), cell(c["definition"])))
        out.append("")
    return "\n".join(out) + "\n", cap_rows


def main():
    db = os.path.join(D, "territory.db")
    con = sqlite3.connect(db)
    groups, caps, subs, claims = read(con)
    group_name = {g["id"]: g["name"] for g in groups}
    for c in caps:
        c["group_name"] = group_name.get(c["group_id"], "")

    counts = {
        "claims": con.execute("SELECT COUNT(*) FROM coverage").fetchone()[0],
        "sources": con.execute("SELECT COUNT(*) FROM source").fetchone()[0],
        "conflicts": con.execute(
            "SELECT COUNT(*) FROM coverage WHERE level='conflicts'").fetchone()[0],
        "subjects": len(subs), "capabilities": len(caps), "groups": len(groups),
    }
    con.close()

    # The build time is the database's own last change, so two runs over one database
    # produce the same bytes.
    built = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(os.path.getmtime(db)))

    csv_text, csv_rows = build_csv(caps, subs, claims)
    md_text, cap_rows = build_md(groups, caps, subs, claims, counts, built)

    if csv_rows != counts["claims"]:
        raise SystemExit("CSV wrote {} rows for {} claims".format(csv_rows, counts["claims"]))
    if cap_rows != counts["capabilities"]:
        raise SystemExit("Markdown wrote {} capability rows for {} capabilities".format(
            cap_rows, counts["capabilities"]))
    for name, text in (("territory.csv", csv_text), ("territory.md", md_text)):
        # The mark is split so this file does not hold the path it looks for; the
        # public sync fails on any file that does.
        for mark in ("/" + "Users/", os.path.expanduser("~")):
            if mark and mark in text:
                raise SystemExit(name + " holds a path from this machine")

    csv_path = os.path.join(BOARD, "territory.csv")
    md_path = os.path.join(BOARD, "territory.md")
    with open(csv_path, "w", encoding="utf-8", newline="") as fh:
        fh.write(csv_text)
    with open(md_path, "w", encoding="utf-8", newline="") as fh:
        fh.write(md_text)
    print("wrote {} ({:,} data rows, {:,} bytes) and {} ({} capability rows, {:,} bytes)".format(
        csv_path, csv_rows, len(csv_text.encode("utf-8")),
        md_path, cap_rows, len(md_text.encode("utf-8"))))
    return 0


if __name__ == "__main__":
    sys.exit(main())
