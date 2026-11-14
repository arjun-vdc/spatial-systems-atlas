#!/usr/bin/env python3
"""Refresh related-use-cases.json from a newer pinned commit of the contributing repository.

    python3 refresh_use_cases.py <folder> --commit <40-hex sha> --committed <ISO time> \
        --refreshed <YYYY-MM-DD> [--write]

<folder> is the contribution folder (data/contributions/vw-ucr) in a checkout of the
contributing repository at that commit. Nothing is fetched: the checkout is made by hand, so the
commit read is the commit recorded.

What a refresh changes, and only with --write:
- the coverage figures, rebuilt from demand.csv;
- for each record that came from the contribution files: its basis, its contributor reason and
  the use case title, from links.csv, and the commit it was read from;
- a record seen only on a public record page whose link is now in links.csv becomes a
  contribution record.

What it never changes: Atlas assessments, confidence, interoperability ratings, lanes, presets,
the quoted passage or its section. A record is never deleted. One whose link has left links.csv,
or whose basis or reason changed after an Atlas review, is marked stale and keeps its old text.

New links in links.csv for a use case are listed, not imported: a record needs the exact words of
the public record it rests on, and that takes a reading of the page.
"""
import argparse, csv, json, os, re, sys

D = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(D, "related-use-cases.json")
REVIEWED = ("accepted", "needs-change", "rejected")


def read_csv(folder, name):
    path = os.path.join(folder, name)
    if not os.path.exists(path):
        sys.exit(f"{path} is missing; give the contribution folder of a checkout")
    with open(path, newline="") as fh:
        return list(csv.DictReader(fh))


def coverage_rows(demand):
    rows = []
    for r in demand:
        rows.append({
            "capability_id": r["cap_id"],
            "source_interop": r["interop"],
            "use_cases": int(r["use_cases"]),
            "specialisations": int(r["specialisations"]),
            "deployments": int(r["deployments"]),
            "use_case_ids": r["use_case_ids"].split(),
            "source_atlas": {"native": int(r["atlas_native"]), "partial": int(r["atlas_partial"]),
                             "scored": int(r["atlas_scored"])},
        })
    return sorted(rows, key=lambda x: x["capability_id"])


def refresh(doc, folder, commit, committed, refreshed):
    """Apply one refresh to the document in place. Returns the lines to report."""
    links = {(r["cap_id"], r["use_case_id"]): r for r in read_csv(folder, "links.csv")}
    report = []
    for rec in doc["records"]:
        uc, cap = rec["use_case"]["id"], rec["capability"]["id"]
        sv, row = rec["source_version"], links.get((cap, uc))
        if rec["origin"] == "contributor-public-record" and row:
            rec["origin"] = "contributor"
            sv["contribution_file"] = "data/contributions/vw-ucr/links.csv"
            report.append(f"{rec['link_id']}: now in the contribution files")
        if rec["origin"] != "contributor":
            sv["in_pinned_commit"] = bool(row)
            continue
        if not row:
            if sv.get("in_pinned_commit", True):
                report.append(f"{rec['link_id']}: no longer in links.csv; marked stale, text kept")
            sv["in_pinned_commit"] = False
            rec["review"]["status"] = "stale"
            continue
        changed = []
        if row["basis"] != rec["basis"]:
            changed.append(f"basis {rec['basis']} -> {row['basis']}")
            rec["basis"] = row["basis"]
        if row["note"] != rec["explanation"]["rationale"]:
            changed.append("reason reworded")
            rec["explanation"]["rationale"] = row["note"]
        if row["use_case"] != rec["use_case"]["title"]:
            changed.append("title changed")
            rec["use_case"]["title"] = row["use_case"]
        if changed:
            report.append(f"{rec['link_id']}: " + "; ".join(changed))
            if rec["review"]["status"] in REVIEWED:
                rec["review"]["status"] = "stale"
        sv["in_pinned_commit"] = True
    for rec in doc["records"]:
        sv = rec["source_version"]
        sv["contribution_commit"] = commit
        sv["contribution_refreshed"] = refreshed
    known = {(r["capability"]["id"], r["use_case"]["id"]) for r in doc["records"]}
    cases = {r["use_case"]["id"] for r in doc["records"]}
    for (cap, uc), row in sorted(links.items(), key=lambda kv: (kv[0][1], kv[0][0])):
        if uc in cases and (cap, uc) not in known:
            report.append(f"{uc}~{cap}: new link in links.csv ({row['basis']}); read the public "
                          f"record before adding it")
    doc["coverage"]["rows"] = coverage_rows(read_csv(folder, "demand.csv"))
    doc["contribution"].update({"commit": commit, "committed": committed, "refreshed": refreshed})
    return report


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("folder")
    ap.add_argument("--commit", required=True)
    ap.add_argument("--committed", required=True)
    ap.add_argument("--refreshed", required=True)
    ap.add_argument("--write", action="store_true")
    ap.add_argument("--target", default=TARGET)
    a = ap.parse_args(argv)
    if not re.fullmatch(r"[0-9a-f]{40}", a.commit):
        sys.exit("--commit takes the full 40-character commit id")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", a.refreshed):
        sys.exit("--refreshed takes a date, YYYY-MM-DD")
    with open(a.target) as fh:
        doc = json.load(fh)
    report = refresh(doc, a.folder, a.commit, a.committed, a.refreshed)
    for line in report:
        print(line)
    print(f"{len(doc['records'])} records, {len(doc['coverage']['rows'])} coverage rows, "
          f"{len(report)} change(s)")
    if a.write:
        with open(a.target, "w") as fh:
            fh.write(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
        print("wrote", a.target, "- now run load.py and build.py")


if __name__ == "__main__":
    main()
