#!/usr/bin/env python3
"""Build board/demand-standalone.html: the map's supply beside the demand the
Virtual Worlds Use Case Repository (VW-UCR, Virtual Dimension Center) records.

A DEMONSTRATION, proposed on the branch `vw-ucr-contributions`. It reads only
board/territory.json (the published export) and the CSV files in
data/contributions/vw-ucr/, and writes one self-contained page. It does not
touch territory.db, load.py or build.py: nothing here changes a published
figure until the maintainers decide to fold it in. See
data/contributions/vw-ucr/README.md.

    cd data
    python3 build_demand.py
"""
from __future__ import annotations

import csv
import html
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
CONTRIB = HERE / "contributions" / "vw-ucr"
OUT = HERE.parent / "board" / "demand-standalone.html"


def rows(name: str) -> list[dict]:
    with open(CONTRIB / name, encoding="utf-8", newline="") as f:
        return list(csv.DictReader(f))


def e(v) -> str:
    return html.escape(str(v if v is not None else ""))


def bar(native: int, partial: int, scored: int) -> str:
    """Native and partial as a share of the subjects scored on the row."""
    if not scored:
        return '<span class="faint">not scored</span>'
    n, p = 100 * native / scored, 100 * partial / scored
    return (f'<span class="bar" title="{native} built in, {partial} partial, of {scored} scored">'
            f'<i class="n" style="width:{n:.1f}%"></i><i class="p" style="width:{p:.1f}%"></i></span>'
            f' <span class="num">{native}/{scored}</span>')


def main() -> int:
    territory = json.loads((HERE.parent / "board" / "territory.json").read_text(encoding="utf-8"))
    caps = {c["id"]: c for c in territory["capabilities"]}
    tally = territory["tally"]
    groups = {g["id"]: g["name"] for g in territory["groups"]}
    names = {s["id"]: s["name"] for s in territory["subjects"]}

    demand = rows("demand.csv")
    links = rows("links.csv")
    evidence = rows("deployment-evidence.csv")
    candidates = rows("candidate-capabilities.csv")

    # Every capability id in the contribution must exist in the export it is
    # read against; a stale contribution should stop the build, not draw.
    unknown = sorted({r["cap_id"] for r in demand + links + evidence} - caps.keys())
    if unknown:
        raise SystemExit(f"capabilities not in territory.json: {unknown}")

    by_cap: dict[str, list[dict]] = {}
    for l in links:
        by_cap.setdefault(l["cap_id"], []).append(l)

    # 1. Supply beside demand
    need_rows = []
    for r in demand:
        c, t = caps[r["cap_id"]], tally[r["cap_id"]]
        uses = " ".join(c.get("uses") or []) or "—"
        flag = c["interop"] == "must" and t["covers"] <= 3
        items = "".join(
            f'<li><a href="{e(l["url"])}">{e(l["use_case_id"])}</a> {e(l["use_case"])}'
            f'<span class="basis">{e(l["basis"])}</span><br><span class="faint">{e(l["note"])}</span></li>'
            for l in by_cap.get(r["cap_id"], []))
        need_rows.append(
            f'<tr class="{"gap" if flag else ""}"><td><b>{e(c["name"])}</b> <code>{e(c["id"])}</code>'
            f'<br><span class="faint">{e(groups.get(c["group_id"], c["group_id"]))}</span>'
            f'<details><summary>{e(r["use_cases"])} use cases</summary><ul>{items}</ul></details></td>'
            f'<td><span class="chip {e(c["interop"])}">{e(c["interop"])}</span></td>'
            f'<td class="faint">{e(uses)}</td>'
            f'<td class="num">{e(r["use_cases"])}</td><td class="num">{e(r["deployments"])}</td>'
            f'<td>{bar(t["covers"], t["partial"], t["scored"])}</td></tr>')

    # 2. Rows the map rates below must, that UCR deployments depend on
    should_with_demand = [r for r in demand
                          if caps[r["cap_id"]]["interop"] != "must" and int(r["deployments"]) >= 3]

    # 3. Deployment evidence, grouped by what it does to the claim
    order = {"none": 0, "conflicts": 1, "": 2, "partial": 3, "via-extension": 4, "native": 5}
    ev = sorted(evidence, key=lambda r: (order.get(r["atlas_verdict"], 9), r["subject_id"], r["cap_id"]))
    ev_rows = "".join(
        f'<tr><td>{e(names.get(r["subject_id"], r["subject_id"]))}</td>'
        f'<td>{e(caps[r["cap_id"]]["name"])} <code>{e(r["cap_id"])}</code></td>'
        f'<td>{("<span class=chip>" + e(r["atlas_verdict"]) + "</span> <span class=faint>" + e(r["atlas_confidence"]) + "</span>") if r["atlas_verdict"] else "<b>not scored</b>"}</td>'
        f'<td><a href="{e(r["url"])}">{e(r["implementation_id"])}</a> {e(r["implementation"])}'
        f'<br><span class="faint">via {e(r["via_use_cases"])}'
        f'{"" if r["realisation"] == "realises" else " · realises it only in part"}</span></td></tr>'
        for r in ev)
    unscored = sum(1 for r in evidence if not r["atlas_verdict"])
    against = sum(1 for r in evidence if r["atlas_verdict"] in ("none", "conflicts"))
    against_full = sum(1 for r in evidence if r["atlas_verdict"] in ("none", "conflicts")
                       and r["realisation"] == "realises")

    cand_rows = "".join(
        f'<tr><td><b>{e(r["name"])}</b> <code>{e(r["id"])}</code><br><span class="faint">{e(r["definition"])}</span></td>'
        f'<td><span class="chip {e(r["interop"])}">{e(r["interop"])}</span> <span class="faint">{e(r["binding"])}</span>'
        f'<br><span class="faint">{e(r["interop_reason"])}</span></td><td class="faint">{e(r["evidence"])}</td></tr>'
        for r in candidates)

    total_uc = len({l["use_case_id"] for l in links})
    page = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Supply and demand — Spatial Systems Atlas</title>
<style>
:root{{--paper:#ECEBE4;--raised:#F7F6F1;--ink:#1B1D1A;--soft:#55584E;--faint:#7E8177;--rule:#C7C5B8;
--chart:#2C5F6B;--chart-fill:#CFE0E1;--contour:#8A6634;--contour-fill:#EBDCC2;--survey:#A33328;--survey-fill:#F0D6D0}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--paper:#15171A;--raised:#1D2024;--ink:#E9E7DE;
--soft:#9C9E94;--faint:#75786F;--rule:#32363A;--chart:#74B6C2;--chart-fill:#1B3238;--contour:#CBA469;
--contour-fill:#312819;--survey:#E37365;--survey-fill:#35201D}}}}
body{{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 "IBM Plex Serif",Georgia,serif}}
main{{padding:24px 16px 64px}}
h1,h2,th,.chip,summary{{font-family:"IBM Plex Sans Condensed",system-ui,sans-serif}}
h1{{margin:.2em 0}} h2{{margin-top:2em;border-top:1px solid var(--rule);padding-top:1em}}
code{{font:12px "IBM Plex Mono",ui-monospace,monospace;color:var(--soft)}}
a{{color:var(--chart)}} .faint{{color:var(--faint);font-size:14px}} .num{{font-variant-numeric:tabular-nums}}
.wrap{{overflow-x:auto}} table{{border-collapse:collapse;width:100%;background:var(--raised)}}
th,td{{text-align:left;vertical-align:top;padding:8px 10px;border-bottom:1px solid var(--rule)}}
th{{font-size:13px;color:var(--soft);font-weight:600}}
tr.gap td:first-child{{box-shadow:inset 3px 0 var(--survey)}}
.chip{{font-size:12px;padding:1px 7px;border-radius:9px;border:1px solid var(--rule)}}
.chip.must{{background:var(--survey-fill);border-color:var(--survey)}} .chip.should{{background:var(--contour-fill)}}
.bar{{display:inline-flex;width:120px;height:9px;background:var(--paper);border:1px solid var(--rule);vertical-align:middle}}
.bar .n{{background:var(--chart)}} .bar .p{{background:var(--chart-fill)}}
.basis{{margin-left:6px;font-size:12px;color:var(--contour)}} details ul{{padding-left:18px;margin:6px 0}}
.stats{{display:flex;flex-wrap:wrap;gap:8px 24px;margin:16px 0}} .stats b{{font-size:22px;display:block}}
</style></head><body><main>
<p class="faint">Spatial Systems Atlas · proposal on branch <code>vw-ucr-contributions</code> · not a published view</p>
<h1>Supply beside demand</h1>
<p>The map measures <b>supply</b>: which systems provide each capability. It cannot measure
<b>demand</b>, because it holds no use cases. The Virtual Worlds Use Case Repository of the Virtual
Dimension Center links its use cases to the map's capabilities, each link resting on a sentence of the
use case, and files real deployments under them. This page reads the two together. Supply figures are
the map's own ({e(territory['counts']['claims'])} claims); demand is the repository's, public records only.</p>
<div class="stats">
<span><b>{len(demand)}</b>capabilities with demand</span>
<span><b>{total_uc}</b>use cases linked</span>
<span><b>{len(evidence)}</b>deployment checks</span>
<span><b>{unscored}</b>pairs the map never scored</span>
<span><b>{len(candidates)}</b>candidate capabilities</span></div>

<h2>1. What the use cases need, beside what the field provides</h2>
<p class="faint">Must rows first, thinnest supply first. A red edge marks a must row that three or fewer
systems provide natively. <em>Map uses</em> is the map's own U1–U4 basis for the row.</p>
<div class="wrap"><table><thead><tr><th>Capability</th><th>Interop</th><th>Map uses</th>
<th>Use cases</th><th>Deployments</th><th>Built in, of scored</th></tr></thead>
<tbody>{''.join(need_rows)}</tbody></table></div>

<h2>2. Rows below must that real deployments depend on</h2>
<p class="faint">The map's interoperability boundaries rest on four use cases (U1–U4). These rows are
rated should or none, and three or more deployments in the repository depend on them: evidence for the
<code>interop_uses</code> column, for the maintainers to weigh.</p>
<ul>{''.join(f'<li><b>{e(caps[r["cap_id"]]["name"])}</b> <code>{e(r["cap_id"])}</code>, {e(caps[r["cap_id"]]["interop"])}: '
             f'{e(r["use_cases"])} use cases, {e(r["deployments"])} deployments</li>' for r in should_with_demand)}</ul>

<h2>3. Deployments set against the platform they ran on</h2>
<p class="faint">For deployments built on a system the map scores. <b>{against}</b> checks meet a
<em>none</em> or <em>conflicts</em> verdict, <b>{against_full}</b> of them from deployments that fully
realise the use case: a deployment that worked around its platform, or a claim to look at again. A
deployment that realises its use case only in part may not exercise the capability at all. <b>{unscored}</b> are pairs with no claim at all, where the repository holds a deployment
that bears on it. Only systems matched to a subject by hand take part.</p>
<div class="wrap"><table><thead><tr><th>System</th><th>Capability</th><th>Map verdict</th><th>Deployment</th></tr></thead>
<tbody>{ev_rows}</tbody></table></div>

<h2>4. Needs the map has no row for</h2>
<p class="faint">Found while linking every use case in the repository. Proposed in the columns of
<code>data/capabilities.csv</code>; the interop value is a proposal argued with the map's own rule.</p>
<div class="wrap"><table><thead><tr><th>Candidate</th><th>Proposed interop</th><th>Use cases</th></tr></thead>
<tbody>{cand_rows}</tbody></table></div>

<p class="faint" style="margin-top:3em">Demand data: Virtual Worlds Use Case Repository,
<a href="https://usecases.vdc-fellbach.de">usecases.vdc-fellbach.de</a>, Virtual Dimension Center
Fellbach. See <code>data/contributions/vw-ucr/README.md</code>.</p>
</main></body></html>
"""
    OUT.write_text(page, encoding="utf-8")
    print(f"wrote {OUT.relative_to(HERE.parent)}: {len(demand)} capabilities, {len(evidence)} checks, "
          f"{len(candidates)} candidates")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
