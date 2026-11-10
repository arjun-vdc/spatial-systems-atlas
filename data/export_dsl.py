#!/usr/bin/env python3
"""Export the territory database as a C4 model written in Structurizr DSL.

One software system holds the open metaverse stack: its containers are the twelve capability
groups and its components are the eighty-nine capabilities. Every subject on the map is a
software system of its own, and every scored claim that reaches a capability is a relationship
from the subject to that component.

The file is written to infrastructure-wg/board/workspace.dsl. Output is deterministic: every
list is sorted, so two runs over the same database give byte-identical files. No path from this
machine reaches the file.

Read-only against territory.db. Writes exactly one file. Run it directly:

    python3 infrastructure-wg/data/export_dsl.py
"""
import os
import re
import sqlite3
import sys

D = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(D, "territory.db")
OUT = os.path.join(os.path.dirname(D), "board", "workspace.dsl")

# The claim levels that become a line in the model, and the words the page uses for them.
# "none" and "out-of-scope" draw nothing: an absent claim is not a relationship.
LEVEL_WORDS = {
    "native": "built in",
    "via-extension": "through an extension",
    "partial": "partial",
    "conflicts": "conflicts — will not interoperate",
}
LEVEL_ORDER = ["native", "via-extension", "partial", "conflicts"]

# The word the page prints in the binding column. A row bound at build time is fixed when the
# content is made; a row bound at connect time is agreed between two systems when they meet.
BINDING_WORD = {"build": "format", "connect": "protocol"}

# The display groups the subject chips are drawn in, copied from build.py so the DSL carries the
# same grouping the page shows. Phase 2 should make one copy serve both.
MSF_IDS = ["rp1", "wow", "teleportxr", "um", "iwps", "omb"]
KIND_LABEL = [("standard", "Standards"), ("device-platform", "Device platforms"),
              ("game-engine", "Game engines"), ("web-runtime", "Web runtimes"),
              ("platform", "Platforms"), ("protocol", "Protocols"), ("project", "Projects"),
              ("world-model", "World models & capture"),
              ("technique", "World models & capture"),
              ("tool", "Capture & generation tools")]
MSF_LABEL = "MSF standards & projects"

# The page's own palette, read from the CSS variables at the top of matrix.html (light theme).
PAPER_RAISED = "#F7F6F1"
PAPER_SUNK = "#E2E1D8"
INK = "#1B1D1A"
INK_FAINT = "#7E8177"
RULE = "#C7C5B8"
RULE_STRONG = "#A9A79A"
CHART = "#2C5F6B"
CHART_FILL = "#CFE0E1"
CONTOUR = "#8A6634"
CONTOUR_FILL = "#EBDCC2"
SURVEY = "#A33328"
SURVEY_FILL = "#F0D6D0"


def ident(raw):
    """Turn a database id into a Structurizr identifier: letters, digits and underscore only."""
    out = raw.replace(".", "_").replace("-", "_")
    if not re.fullmatch(r"[A-Za-z0-9_]+", out):
        sys.exit(f"id {raw!r} does not reduce to a legal identifier (got {out!r})")
    return out


def q(text):
    """One DSL string. Quotes are escaped and every line break becomes a space."""
    s = "" if text is None else str(text)
    s = re.sub(r"\s+", " ", s).strip()
    return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'


def first_sentence(text):
    """The first sentence of a summary, kept whole. Falls back to the whole text."""
    s = re.sub(r"\s+", " ", (text or "")).strip()
    if not s:
        return ""
    m = re.match(r"^(.*?[.!?])(?:\s|$)", s)
    return m.group(1) if m else s


def display_groups(subjects):
    """subject id -> the name of the chip group the page draws it in. One group per subject."""
    where = {}
    ids = {s["id"] for s in subjects}
    for sid in MSF_IDS:
        if sid in ids:
            where[sid] = MSF_LABEL
    for kind, label in KIND_LABEL:
        for s in subjects:
            if s["kind"] == kind and s["id"] not in where:
                where[s["id"]] = label
    for s in subjects:
        where.setdefault(s["id"], s["kind"])
    return where


def main():
    if not os.path.exists(DB):
        sys.exit(f"no database at {DB}")
    con = sqlite3.connect(f"file:{DB}?mode=ro", uri=True)
    con.row_factory = sqlite3.Row

    groups = [dict(r) for r in con.execute(
        "SELECT id,name,plane,sort FROM capability_group ORDER BY sort, id")]
    caps = [dict(r) for r in con.execute(
        "SELECT id,group_id,name,definition,binding,sort FROM capability ORDER BY sort, id")]
    subjects = [dict(r) for r in con.execute(
        "SELECT id,name,kind,org,licence,url,status,version,summary FROM subject "
        "ORDER BY kind, name, id")]
    covers = [dict(r) for r in con.execute(
        "SELECT subject_id,capability_id,level,confidence FROM coverage "
        "WHERE level IN ('native','via-extension','partial','conflicts') "
        "ORDER BY subject_id, capability_id")]
    con.close()

    # Every identifier in one flat namespace, so a clash is caught here and not by the parser.
    seen = {}
    def claim(raw, what):
        name = ident(raw)
        if name in seen:
            sys.exit(f"identifier {name!r} wanted by both {seen[name]} and {what}")
        seen[name] = what
        return name

    stack_id = claim("stack", "the stack software system")
    group_ident = {g["id"]: claim(g["id"], f"group {g['id']}") for g in groups}
    cap_ident = {c["id"]: claim(c["id"], f"capability {c['id']}") for c in caps}
    subj_ident = {s["id"]: claim(s["id"], f"subject {s['id']}") for s in subjects}

    caps_by_group = {g["id"]: [] for g in groups}
    for c in caps:
        if c["group_id"] not in caps_by_group:
            sys.exit(f"capability {c['id']} names group {c['group_id']}, which does not exist")
        caps_by_group[c["group_id"]].append(c)

    where = display_groups(subjects)
    L = []
    w = L.append

    w(q("Open metaverse territory") + " " + q(
        f"The Metaverse Standards Forum infrastructure map as a C4 model: {len(caps)} "
        f"capabilities in {len(groups)} groups, {len(subjects)} subjects, and {len(covers)} "
        f"claims that reach a capability.") + " {")
    w("")
    w("    model {")
    w("")
    w(f"        {stack_id} = softwareSystem " + q("Open metaverse stack") + " "
      + q(f"The {len(caps)} capabilities an open metaverse needs, in {len(groups)} groups.")
      + " " + q("stack") + " {")

    for g in groups:
        members = caps_by_group[g["id"]]
        w("")
        w(f"            {group_ident[g['id']]} = container " + q(g["name"]) + " "
          + q(f"{len(members)} capabilities, on the {g['plane']} plane.") + " "
          + q(g["plane"]) + " " + q(f"capability_group,{g['plane']}") + " {")
        for c in members:
            word = BINDING_WORD.get(c["binding"], c["binding"])
            w(f"                {cap_ident[c['id']]} = component " + q(c["name"]) + " "
              + q(c["definition"]) + " " + q(word) + " " + q(f"capability,{word}"))
        w("            }")
    w("        }")

    w("")
    w("        # Every subject on the map is a software system of its own. Tags carry its kind")
    w("        # and its status; the group property carries the chip group the page draws it in.")
    for s in subjects:
        w("")
        w(f"        {subj_ident[s['id']]} = softwareSystem " + q(s["name"]) + " "
          + q(first_sentence(s["summary"])) + " "
          + q(",".join(t for t in (s["kind"], s["status"]) if t)) + " {")
        if s["url"]:
            w("            url " + q(s["url"]))
        w("            properties {")
        w("                " + q("group") + " " + q(where.get(s["id"], s["kind"])))
        if s["org"]:
            w("                " + q("org") + " " + q(s["org"]))
        if s["licence"]:
            w("                " + q("licence") + " " + q(s["licence"]))
        if s["version"]:
            w("                " + q("version") + " " + q(s["version"]))
        w("            }")
        w("        }")

    w("")
    w("        # One relationship per claim that reaches a capability. A claim recorded as")
    w("        # absent or out of scope draws nothing.")
    for r in covers:
        if r["subject_id"] not in subj_ident or r["capability_id"] not in cap_ident:
            sys.exit(f"claim {r['subject_id']} -> {r['capability_id']} names a missing element")
        w("")
        w(f"        {subj_ident[r['subject_id']]} -> {cap_ident[r['capability_id']]} "
          + q(LEVEL_WORDS[r["level"]]) + " {")
        w("            tags " + q(r["level"]))
        w("            properties {")
        w("                " + q("confidence") + " " + q(r["confidence"]))
        w("            }")
        w("        }")

    w("")
    w("    }")
    w("")
    w("    views {")
    w("")
    w("        systemLandscape " + q("landscape") + " "
      + q(f"Every subject on the map, and the stack they are measured against.") + " {")
    w("            include *")
    w("            autoLayout")
    w("        }")
    w("")
    w(f"        container {stack_id} " + q("groups") + " "
      + q(f"The {len(groups)} capability groups inside the stack.") + " {")
    w("            include *")
    w("            autoLayout")
    w("        }")
    for g in groups:
        members = caps_by_group[g["id"]]
        w("")
        w(f"        component {group_ident[g['id']]} " + q(f"component_{group_ident[g['id']]}")
          + " " + q(f"{g['name']}: {len(members)} capabilities and the subjects that reach them.")
          + " {")
        w("            include *")
        w("            autoLayout")
        w("        }")

    w("")
    w("        styles {")
    for tag, body in [
        ("Element", [("color", INK), ("background", PAPER_RAISED), ("stroke", RULE_STRONG),
                     ("strokeWidth", "2"), ("fontSize", "22")]),
        ("stack", [("background", PAPER_SUNK), ("stroke", INK), ("shape", "RoundedBox")]),
        ("Container", [("background", PAPER_SUNK), ("stroke", RULE_STRONG),
                       ("shape", "RoundedBox")]),
        ("Component", [("background", PAPER_RAISED), ("stroke", RULE), ("shape", "Component")]),
        ("protocol", [("stroke", SURVEY), ("strokeWidth", "3")]),
        ("format", [("stroke", INK_FAINT)]),
        ("standard", [("background", CHART_FILL), ("stroke", CHART)]),
        ("web-runtime", [("background", PAPER_SUNK), ("stroke", CHART)]),
        ("game-engine", [("background", CONTOUR_FILL), ("stroke", CONTOUR)]),
        ("platform", [("background", SURVEY_FILL), ("stroke", SURVEY)]),
        ("protocol-subject", [("background", CHART_FILL), ("stroke", CONTOUR)]),
        ("project", [("background", PAPER_RAISED), ("stroke", CONTOUR)]),
    ]:
        w("            element " + q(tag) + " {")
        for k, v in body:
            w(f"                {k} {v}")
        w("            }")
    for tag, body in [
        ("native", [("color", INK), ("style", "solid"), ("thickness", "3")]),
        ("via-extension", [("color", CHART), ("style", "solid"), ("thickness", "2")]),
        ("partial", [("color", CONTOUR), ("style", "dashed"), ("thickness", "2")]),
        ("conflicts", [("color", SURVEY), ("style", "solid"), ("thickness", "4")]),
    ]:
        w("            relationship " + q(tag) + " {")
        for k, v in body:
            w(f"                {k} {v}")
        w("            }")
    w("        }")
    w("    }")
    w("}")

    text = "workspace " + "\n".join(L) + "\n"
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        fh.write(text)

    by_level = {k: 0 for k in LEVEL_ORDER}
    for r in covers:
        by_level[r["level"]] += 1
    print("wrote", OUT)
    print(f"  groups {len(groups)}  capabilities {len(caps)}  subjects {len(subjects)}"
          f"  relationships {len(covers)}")
    print("  " + "  ".join(f"{k} {by_level[k]}" for k in LEVEL_ORDER))
    print(f"  views {2 + len(groups)}")


if __name__ == "__main__":
    main()
